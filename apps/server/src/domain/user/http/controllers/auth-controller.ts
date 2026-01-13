import { Request, Response } from "express";
import { makeUserService } from "../../factories/user-function";
import { UserService } from "../../user-service";

export class AuthController {
  private readonly service: UserService;

  constructor() {
    this.service = makeUserService();
  }

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await this.service.login(email, password);

    return res.json(result);
  };
}