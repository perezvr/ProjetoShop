import Sequelize, { Model } from 'sequelize';

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
      },
      {
        // Obejto da conexão com db
        sequelize,
      }
    );

    // Retornando o usuário
    return this;
  }

  /**
   * Efetuando a assiciação dos models
   * Quando faz associação mais de uma vez com o mesmo model (User),
   * é obrigatório utilizar o alias
   */
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointment;
