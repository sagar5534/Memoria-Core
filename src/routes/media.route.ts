import { Router } from "express";
import { Callback } from "mongoose";
import { FileFilterCallback, Multer, MulterError } from "multer";
import { MediaController } from "../controllers/media.controller";
// tslint:disable-next-line
const multer = require('multer')
const mediaRoutes = Router();
const mediaController = new MediaController();

const storage = multer.diskStorage({
  destination (req: Request, file: Express.Multer.File, cb: Callback) {
    cb(null, "public/uploads/")
  },
  filename (req: Request, file: Express.Multer.File, cb: Callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + '-' + uniqueSuffix)
  }
})
const upload = multer({ storage })

mediaRoutes.get("/", mediaController.index);
mediaRoutes.get("/:id", mediaController.find);
mediaRoutes.post("/", mediaController.create);
mediaRoutes.put("/:id", mediaController.update);
mediaRoutes.delete("/:id", mediaController.delete);

// Upload
mediaRoutes.post("/upload", upload.single('file'), mediaController.uploadSingle);

export default mediaRoutes;
