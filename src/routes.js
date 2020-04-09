import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);
// Rotas executadas antes do middleWare de autenticação do User
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Todos as rotas abaixo dessa linha utilizarão esse middleware
routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', AppointmentController.store);

routes.get('/schedule', ScheduleController.index);

// Essa rota chama o middleware de upload do conteúdo passado como Multpart
// Form da requisição ('file') através das configurações definidas no Config/Multer.js
// Após isso, chama o método de gravação do arquivo no banco de dados
// Nesse caso o multer libera uma variável req.file para ser tratada pelo controller
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
