import { Request, Response } from "express";
import { makeUserService } from "../../factories/user-function";
import { UserService } from "../../user-service";

export class UserController {
  private readonly service: UserService;

  constructor() {
    this.service = makeUserService();
  }

  createUser = async (req: Request, res: Response) => {
    const user = await this.service.create(req.body);
    return res.status(201).json(user.toPublic());
  };

  getUserById = async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    const user = await this.service.getUserById(userId);
    return res.json(user.toPublic());
  };

  list = async (req: Request, res: Response) => {
    const users = await this.service.list(req.query);
    return res.json(users.map((u) => u.toPublic()));
  };

  updateUser = async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    const user = await this.service.update(userId, req.body);
    return res.json(user.toPublic());
  };

  deleteUser = async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    await this.service.delete(userId);
    return res.status(204).send();
  };
}
