import { prisma } from "../../infra/prisma/prisma.client";
import { Role } from "@prisma/client";
import { UserMapper } from "./user.mapper";
import { UserEntity } from "./user-entity";
import { AppError } from "../../errors/AppError";
import { UpdateUserDTO } from "./dtos/user.dto";

export class PrismaUserRepository implements PrismaUserRepository {
    async findById(userId: string): Promise<UserEntity | null> {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            return user ? UserMapper.toEntity(user) : null;
        } catch (error) {
            console.log(error)
            if (error instanceof AppError) {
                throw error
            }
            throw new AppError("Error finding user by ID", 500);
        }
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
        return user ? UserMapper.toEntity(user) : null;
    }

    async create(entity: UserEntity): Promise<UserEntity> {
        const created = await prisma.user.create({
            data: {
                id: entity.id,
                name: entity.name,
                email: entity.email,
                password: entity.password,
                role: entity.role,
            },
        });
        return UserMapper.toEntity(created);
    }

    async list(params?: { role?: Role; skip?: number; take?: number }): Promise<UserEntity[]> {
        const { role, skip = 0, take = 20 } = params ?? {};
        const users = await prisma.user.findMany({
            where: role ? { role } : undefined,
            skip,
            take,
            orderBy: { createdAt: "desc" },
        });
        return users.map(UserMapper.toEntity);
    }

    async update(id: string, data: UpdateUserDTO): Promise<UserEntity> {
        const updated = await prisma.user.update({
            where: { id },
            data: {
                ...(data.name ? { name: data.name.trim() } : {}),
                ...(data.password ? { password: data.password } : {}),
            },
        });
        return UserMapper.toEntity(updated);
    }
}
