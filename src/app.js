import express from 'express';
import path from 'path';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    // Criando uma rota para o static e definindo um caminho
    // express.static => Recurso que serve arquivos para o frontend
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  // Definfindo as rotas do servidor
  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
