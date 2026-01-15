import { Request, Response } from "express";
import { makeUserService } from "../../factories/make-user-service";
import { UserService } from "../../user-service";

export class UserController {
  private readonly service: UserService;

  constructor() {
    this.service = makeUserService();
  }

  createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.service.create(req.body);
      return res.status(201).json(user.toPublic());
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id as string;
      const user = await this.service.getUserById(userId);
      return res.json(user.toPublic());
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id as string;
      const user = await this.service.updateUserInfo(userId, req.body);
      return res.json(user.toPublic());
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
