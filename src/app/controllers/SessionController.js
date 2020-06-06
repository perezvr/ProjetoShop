import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import authConfig from '../../config/auth';

import User from '../models/User';

class SessionController {
  /**
   * Cria uma session
   * @param req request
   * @param res response
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    // Validando o shcema definido acima
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Variáveis necessárias para criação de uma Session para um User
    const { email, password } = req.body;

    // Buscando User pelo email usando short sintaxe, substituindo => { where: { email: email } }
    const user = await User.findOne({ where: { email } });
    // Caso não exista um user, retorna-se um erro
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    // Caso a senha nao esteja correta, retorna-se um erro
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    // Variáveis que serão retornadas para a requisição
    const { id, name } = user;

    return res.json({
      // Dados do usuário
      user: {
        id,
        name,
        email,
      },
      // Token de autenticação da session gerado pelo JWT, retornando somente o id do User
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
