import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
      },
      {
        // Obejto da conexão com db
        sequelize,
      }
    );

    // Retornando o usuário
    return this;
  }
}

export default File;
