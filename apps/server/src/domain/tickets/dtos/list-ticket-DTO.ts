import { z } from "zod";
import { TicketPriority, TicketStatus } from "@prisma/client";

export const roleSchema = z.enum(["CLIENT", "TECH"]);

export const listTicketsServiceSchema = z.object({
  page: z.coerce.number().int().min(1),
  limit: z.coerce.number().int().min(1).max(10),

  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),

  createdAt: z.string().datetime().optional(),

  userId: z.string().uuid(),
  role: roleSchema,
});

export const listTicketsRepoSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(10),

  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),

  createdAt: z.string().datetime().optional(),
  clientId: z.string().uuid().optional(),
});

export type ListTicketsServiceParams = z.infer<typeof listTicketsServiceSchema>;

export type ListTicketsRepoParams = z.infer<typeof listTicketsRepoSchema>;
