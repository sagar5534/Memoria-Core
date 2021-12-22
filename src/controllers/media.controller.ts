import { MediaService } from "../service/media.service";
import { ThumbnailService } from "../service/thumbnails.service";
import { Request, Response } from "express";
import { Media } from "../models/media.model";
import { Types } from "mongoose";
import * as fs from "fs";
// tslint:disable-next-line
const moment = require("moment");

const service: MediaService = new MediaService();
const thumbnailService: ThumbnailService = new ThumbnailService();
export class MediaController {
  async index(req: Request, res: Response) {
    res.send(await service.findAll());
  }

  async findAssetIds(req: Request, res: Response) {
    if (!req.body.user) return res.sendStatus(400);
    const user = req.body.user;
    res.send(await service.findAllAssetIds(user));
  }

  async find(req: Request, res: Response) {
    if (!req.params.id) return res.sendStatus(400);
    try {
      res.send(await service.findOne(req.params.id));
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async create(req: Request, res: Response) {
    if (!req.body.media) return res.sendStatus(400);
    try {
      res.send(await service.create(req.body.media));
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async update(req: Request, res: Response) {
    if (!req.params.id) return res.sendStatus(400);
    if (!req.body.updatedMedia) return res.sendStatus(400);
    try {
      res.send(await service.update(req.params.id, req.body.updatedMedia));
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async delete(req: Request, res: Response) {
    if (!req.params.id) return res.sendStatus(400);
    try {
      res.send(await service.delete(req.params.id));
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async upload(req: Request, res: Response) {
    if (!req.files) return res.sendStatus(500);
    if (!req.body.user) return res.sendStatus(400);
    if (!req.body.assetId) return res.sendStatus(400);

    const mediaType = parseInt(req.body.mediaType, 10);
    const mediaSubtype = parseInt(req.body.mediaSubType, 10);
    const duration = parseFloat(req.body.duration);
    const isFavorite = service.translateStrToBool(req.body.isFavorite);
    const isHidden = service.translateStrToBool(req.body.isHidden);
    const isLivePhoto = service.translateStrToBool(req.body.isLivePhoto);
    let livePhotoPath = "";

    if (isLivePhoto && req.files.length > 1) {
      livePhotoPath = (req.files as any)[1].path;
    }

    const temp: Media = {
      user: new Types.ObjectId(req.body.user),
      assetId: req.body.assetId,
      filename: req.body.filename,
      mediaType,
      mediaSubtype,
      creationDate: new Date(moment.unix(req.body.creationDate).toDate()),
      modificationDate: new Date(
        moment.unix(req.body.modificationDate).toDate()
      ),
      duration,
      isFavorite,
      isHidden,
      isLivePhoto,
      path: (req.files as any)[0].path,
      thumbnail_path: "",
      livePhoto_path: livePhotoPath,
    };

    try {
      for (const file of req.files as any) {
        console.log("File Upload Success", file.path, req.body.assetId);
      }

      await service.create(temp);
      res.sendStatus(200);
      console.log("Database Update Success", req.body.assetId);
      thumbnailService.makeThumbnail(
        (req.files as any)[0].path,
        req.body.filename
      );
    } catch (error) {
      console.error("File Upload Error", error);

      for (const file of req.files as any) {
        fs.unlink(file.path, (err) => {
          if (err) return console.log(err);
          console.warn("File Deleted", file.path, req.body.assetId);
        });
      }

      res.status(500).send(error);
    }
  }
}
