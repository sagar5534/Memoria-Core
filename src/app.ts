import express, { Express } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes";
// tslint:disable-next-line
const punch = require("holepunch");

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH;
const REMOTE_ACCESS = process.env.REMOTE_ACCESS === "true";

app.use(express.json());
app.use(routes);

mongoose.connect(DB_PATH);

if (REMOTE_ACCESS) {
  punch({
    debug: false,
    mappings: [{ internal: PORT, external: 3001, secure: false }],
    upnp: true,
    pnp: true,
  });
}

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`Running on ${PORT} ⚡`);
});
