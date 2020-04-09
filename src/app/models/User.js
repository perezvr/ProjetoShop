import Sequelize, { Model } from 'sequelize';
// Importação do bcryptjs para geração de Hash do password
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        // Criando campo virtual que será passado pela requisição (não é gravado no db)
        password: Sequelize.VIRTUAL,
        // Criando campo que será efetivamente gravado no db
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        // Obejto da conexão com db
        sequelize,
      }
    );

    // Funcionalidade do sequelize para adicionar eventos (antes do create ou update)
    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        // Criando um hash a partir do password digitado pelo usuário
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    // Retornando o usuário
    return this;
  }

  // Método cria o relacionamento do model file com user
  static associate(models) {
    // belongsTo => Define que teremos um objeto de file em user, referenciando
    // o campo avatar_id com alias: 'avatar'
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  // Método de checagem de senha para o usuário, passando o password
  checkPassword(password) {
    // Comparando senha digitada pelo usuário com seu hash.
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
