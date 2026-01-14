import { Role } from "@prisma/client";

export type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type UpdateUserDTO = Partial<Pick<CreateUserDTO, "name" | "password">>;