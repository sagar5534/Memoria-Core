import { Router } from 'express';

import usersRouter from './routes/user.route';
import mediaRoutes from './routes/media.route';

const routes = Router();

routes.use('/users', usersRouter);
routes.use('/media', mediaRoutes);

export default routes;
