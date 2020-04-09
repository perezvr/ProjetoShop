module.exports = {
  up: (queryInterface, Sequelize) => {
    // Criando relacionamento da tabela files e users
    return queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      // Criando a fk
      references: { model: 'files', key: 'id' },
      // Altera a pk caso o id do file seja alterado
      onUpdate: 'CASCADE',
      // Seta null para o avatar_id caso o file seja deletado da tabela
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
