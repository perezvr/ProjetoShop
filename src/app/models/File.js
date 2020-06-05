import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          // Campo virtual para retornar o path completo de onde está o file no disco
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        // Obejto da conexão com db
        sequelize,
      }
    );

    // Retornando o File
    return this;
  }
}

export default File;
