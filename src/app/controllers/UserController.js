// Importando a biblioteca de validação Yup dessa forma pois não há exports
import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  // Create User
  async store(req, res) {
    const schema = Yup.object().shape({
      // string obrigatório
      name: Yup.string().required(),
      // string obrigatório em formato de email
      email: Yup.string().email().required(),
      // string obrigatório com, com lenght mínimo de 6 caracteres
      password: Yup.string().required().min(6),
    });

    // Validando o schema definido com o body da requisição
    if (!(await schema.isValid(req.body))) {
      // Caso não seja validado, já informamos um erro ao usuário
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Verificando no banco se já existe algum user com o mesmo email (coluna unique)
    const userExists = await User.findOne({ where: { email: req.body.email } });

    // Caso já exista um usuário com o email, é retornado um erro.
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Chamada para a gravação do User no db
    const { id, name, email, provider } = await User.create(req.body);

    // Essa é a estrutura que será retornada para a requisição
    // Passamos somente os campos que a aplicação cliente deve obter
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  // Update User
  async update(req, res) {
    // Schema de validação de User para updates
    const schema = Yup.object().shape({
      // string
      name: Yup.string(),
      // Valida um formato de email, nesse caso não é obrigatório
      email: Yup.string().email(),
      // oldPassword não é obrigatório
      oldPassword: Yup.string().min(6),
      // Novo Password de no mínimo 6 caracteres e, quando o oldPassword tiver
      // sido preenchido, o campo se torna obrigatório
      password: Yup.string()
        .min(6)
        // .when('campoASerVerificado',
        // ('campoASerVerificado', 'proprioField_que_chama_o_when'))
        .when('oldPassword', (oldPassword, field) =>
          // Defifindo o campo como required se o campoASerVerificado existir
          oldPassword ? field.required() : field
        ),
      // Defininfo o confirmPassword obrigatório caso o password seja passado
      confirmPassword: Yup.string().when('password', (password, field) =>
        // Caso haja password o oneOf() verifica todos os valores possíveis
        // Yup.ref('password') passando como valor a ser comparado o 'password'
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Extraindo os dados necessários para alteração do usuário
    const { email, oldPassword } = req.body;

    // Buscando usuário pelo id
    const user = await User.findByPk(req.userId);

    // Caso estejamos alterando o email verificamos se já não está
    // sendo usado por outro user
    if (email !== user.email) {
      // Verificando no banco se já existe algum user com o mesmo email (coluna unique)
      const userExists = await User.findOne({ where: { email } });

      // Caso já exista um usuário com o email, é retornado um erro.

      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    // Verificando se o antigo password foi passado corretamente, porém somente
    // se o oldPassword ofi informado
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    // Atualizando as informações do usuário e retornando somente id, name e
    // provider para o responser
    const { id, name, provider } = await user.update(req.body);

    // Retornando informações no response
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
