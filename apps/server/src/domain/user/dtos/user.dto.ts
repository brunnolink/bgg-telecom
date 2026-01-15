import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(150),
  password: z.string().min(6).max(100),
  role: z.nativeEnum(Role),
});

export const updateUserSchema = createUserSchema
  .pick({
    name: true,
    email: true,
    password: true,
  })
  .partial();

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;