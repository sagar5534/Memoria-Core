import { Router } from "express";
import { Callback } from "mongoose";
import { FileFilterCallback, Multer, MulterError } from "multer";
import { MediaController } from "../controllers/media.controller";
import * as fs from 'fs';
import * as path from 'path';


// tslint:disable-next-line
const multer = require('multer')
const mediaRoutes = Router();
const mediaController = new MediaController();

const storage = multer.diskStorage({
  destination (req: Request, file: Express.Multer.File, cb: Callback) {
    cb(null, "public/uploads/")
  },
  filename (req: Request, file: Express.Multer.File, cb: Callback) {
    const fileExt = file.originalname.split('.').pop();
    const filename = (req.body as any).filename ?? "File"

    let counter = 0;
    let dupl = "";
    while (fs.existsSync(path.join("public/uploads",filename + dupl + "." + fileExt))) {
      counter += 1;
      dupl = "(" + counter + ")"
    }
    cb(null, filename + dupl + "." + fileExt)
  }
})
const upload = multer({ storage })

mediaRoutes.get("/", mediaController.index);
mediaRoutes.get("/:id", mediaController.find);
mediaRoutes.post("/", mediaController.create);
mediaRoutes.put("/:id", mediaController.update);
mediaRoutes.delete("/:id", mediaController.delete);

// Upload
mediaRoutes.post("/uploads", upload.array('files'), mediaController.upload);

export default mediaRoutes;
