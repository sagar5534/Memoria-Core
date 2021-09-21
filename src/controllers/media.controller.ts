import { MediaService } from "../service/media.service";
import { Request, Response } from "express";
import { Media } from "../models/media.model";
import { Types } from "mongoose";
// tslint:disable-next-line
const moment = require('moment');
const service: MediaService = new MediaService();
export class MediaController {
  async index(req: Request, res: Response) {
    res.send(await service.findAll());
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

  async uploadSingle(req: Request, res: Response) {
    if (!req.body.user) return res.sendStatus(400);
    if (!req.body.assetId) return res.sendStatus(400);
    if (!req.body.creationDate) req.body.creationDate = moment().unix();
    if (!req.body.isFavorite) {
      req.body.isFavorite = false;
    } else {
      if (req.body.isFavorite === 'true') {
        req.body.isFavorite = true;
      } else if (req.body.isFavorite === 'false') {
        req.body.isFavorite = false;
      }
    }

    const temp: Media = {
      name: req.file.originalname,
      user: new Types.ObjectId(req.body.user),
      assetId: req.body.assetId,
      creation_date: new Date(moment.unix(req.body.creationDate).toDate()),
      isFavorite: req.body.isFavorite,
      path: req.file.path,
      thumbnail_path: '',
    };

    try {
      res.send(await service.create(temp));

      // Call for the Rest of the work
    } catch (error) {
      res.status(500).send(error);
    }
  }
}
