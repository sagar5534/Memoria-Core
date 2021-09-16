import { Router } from "express";
import { MediaController } from "../controllers/media.controller";

const mediaRoutes = Router();
const mediaController = new MediaController();

mediaRoutes.get("/", mediaController.index);

export default mediaRoutes;
