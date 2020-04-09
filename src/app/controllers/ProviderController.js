import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    // Carregando os users com provider: true
    const providers = await User.findAll({
      // Filtro
      where: { provider: true },
      // Filtrando somente os campos necessários para o response
      attributes: ['id', 'name', 'email', 'avatar_id'],
      // efetuando um join com File
      include: [
        {
          model: File,
          // Definindo alias para o response
          as: 'avatar',
          // Definindo os atributos do response
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(providers);
  }
}

export default new ProviderController();
