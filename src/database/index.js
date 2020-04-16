import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

import databaseConfig from '../config/database';

// Definindo todos os models
const models = [User, File, Appointment];

class Database {
  constructor() {
    // Iniciando o banco relacional
    this.init();
    // Iniciando o mongo
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      // mapeando os models para utlizarem o database
      .map((model) => model.init(this.connection))
      // mapeando os relacionamentos (associates) dos models
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }

  mongo() {
    // Definindo a configuração para utilização do mongoDB pela aplicação
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      // Para previnir warning de método depreciado
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
