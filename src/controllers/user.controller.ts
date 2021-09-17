import { UserService } from "../service/user.service";
import { Request, Response } from "express";

const service: UserService = new UserService();

export class UserController {
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
    if (!req.body.user) return res.sendStatus(400);
    try {
      res.send(await service.create(req.body.user));
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async update(req: Request, res: Response) {
    if (!req.params.id) return res.sendStatus(400);
    if (!req.body.updatedUser) return res.sendStatus(400);
    try {
      res.send(await service.update(req.params.id, req.body.updatedUser));
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
}
