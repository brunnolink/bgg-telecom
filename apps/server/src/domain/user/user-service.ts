import { randomUUID } from "crypto";
import { PrismaUserRepository } from "./user-repository";
import { UserEntity } from "./user-entity";
import { AppError } from "../../errors/AppError";
import { CreateUserDTO, UpdateUserDTO } from "./dtos/user.dto";
import bcrypt from "bcryptjs";
import { jwtSingleton } from "../../singletons/middleware/jwt";

export class UserService {
  constructor(private readonly repo: PrismaUserRepository) { }

  async create(data: CreateUserDTO) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new AppError("The email is already in use", 400);
    const hashed = await bcrypt.hash(data.password, 10);
    const entity = new UserEntity({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
    });

    return this.repo.createUser(entity);
  }

  async login(email: string, password: string) {
    const user = await this.repo.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid password");
    }

    const token = jwtSingleton.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      token,
      user: user.toPublic(),
    };
  }

  async getUserById(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async updateUserInfo(userId: string, data: UpdateUserDTO) {
    await this.getUserById(userId);
    return this.repo.updateUserInfo(userId, data);
  }
}
