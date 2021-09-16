
import { MediaService } from '../service/media.service';
import { Request, Response } from 'express';

const service: MediaService = new MediaService()

export class MediaController {

  async index(req: Request, res: Response) {
    res.send( await service.findAll() );
  }

  async find(req: Request, res: Response) {
    res.send( await service.findAll() );
    // return await service.findOne(id);
  }

  async create(req: Request, res: Response) {
    res.send( await service.findAll() );
    // return await service.create(user);
  }

  async update(req: Request, res: Response) {
    res.send( await service.findAll() );
    // return await service.update(id, updateUser);
  }

  async delete(req: Request, res: Response) {
    res.send( await service.findAll() );
    // return await service.delete(id);
  }
}