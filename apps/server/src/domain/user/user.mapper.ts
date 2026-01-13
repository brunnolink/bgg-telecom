import { User } from "@prisma/client"; 
import { UserEntity } from "./user-entity";

export const UserMapper = {
  toEntity(db: User) {
    return new UserEntity({
      id: db.id,
      name: db.name,
      email: db.email,
      password: db.password,
      role: db.role,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    });
  },
};
