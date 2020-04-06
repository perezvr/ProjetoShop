import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Rotas executadas antes do middleWare de autenticação do User
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Todos as rotas abaixo dessa linha utilizarão esse middleware
routes.use(authMiddleware);

routes.put('/users', UserController.update);

export default routes;
