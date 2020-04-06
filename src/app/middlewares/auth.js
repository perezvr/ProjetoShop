// Importação do Jwt para autenticação de sessions
import jwt from 'jsonwebtoken';
// Promisify transforma uma função que necessita de um callBack e transforma
// numa sintaxe de async/await
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  // Pegando o token de autenticação do Header da requisição
  const authHeader = req.headers.authorization;

  // Caso o token não exista, já retornamos um erro
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // Dividindo a string pelo ' ' e pegando a segunda posição do array
  const [, token] = authHeader.split(' ');

  try {
    // Para utilizar o jwt como uma função assíncrona, precisamos utilizar o Promisify
    // Que nos permite utilizar a opção de await ao invés de trabalhar com uma sintaxe antiga de callBack
    // await promisify(jwt.verify) => Retorna uma funcão passando a função de verify como parâmetro
    // (token, authConfig.secret) => Parâmetros passados para a função retornada
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Retorando o id do User logado que foi gravado no token na função jwt.sign().
    // Com isso não é preciso incluir o id como parâmetro da requisição, pois ele já se encontra no token
    // Incluímos essa informação na requisição para podermos usar futuramente
    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
