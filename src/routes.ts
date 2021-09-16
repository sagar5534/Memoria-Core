import { Router } from 'express';
import usersRouter from './routes/user.route';

const routes = Router();

routes.use('/users', usersRouter);

export default routes;
