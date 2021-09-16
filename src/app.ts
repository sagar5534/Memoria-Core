import express, { Express, Request, Response } from 'express';
// import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './routes';

dotenv.config();

const app: Express = express()
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

mongoose.connect(DB_PATH)

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`Running on ${PORT} ⚡`)
});
