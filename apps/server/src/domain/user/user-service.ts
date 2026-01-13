import { randomUUID } from "crypto";
import { PrismaUserRepository } from "./user-repository";
import { UserEntity } from "./user-entity";
import { AppError } from "../../errors/AppError";
import { CreateUserDTO, UpdateUserDTO } from "./user.dto";
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

    return this.repo.create(entity);
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

  async list(query: { role?: any; page?: any; limit?: any }) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const skip = (page - 1) * limit;

    return this.repo.list({ role: query.role, skip, take: limit });
  }

  async update(userId: string, data: UpdateUserDTO) {
    await this.getUserById(userId);
    return this.repo.update(userId, data);
  }

  async delete(userId: string) {
    await this.getUserById(userId);
    await this.repo.delete(userId);
    return { deleted: true };
  }
}
