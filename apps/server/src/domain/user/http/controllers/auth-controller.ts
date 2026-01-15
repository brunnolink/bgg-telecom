import { Request, Response } from "express";
import { makeUserService } from "../../factories/make-user-service";
import { UserService } from "../../user-service";

export class AuthController {
  private readonly service: UserService;

  constructor() {
    this.service = makeUserService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await this.service.login(email, password);

      return res.json(result);
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(401).json({ error: "Invalid credentials" });
    }
  };
}