import { Router } from "express";
import { MediaController } from "../controllers/media.controller";

const mediaRoutes = Router();
const mediaController = new MediaController();

mediaRoutes.get("/", mediaController.index);
mediaRoutes.get("/:id", mediaController.find);
mediaRoutes.post("/", mediaController.create);
mediaRoutes.put("/:id", mediaController.update);
mediaRoutes.delete("/:id", mediaController.delete);

export default mediaRoutes;
