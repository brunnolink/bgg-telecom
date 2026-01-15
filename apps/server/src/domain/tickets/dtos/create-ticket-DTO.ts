import { TicketPriority, TicketStatus } from "@prisma/client";
import z from "zod";

export const createTicketSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    priority: z.nativeEnum(TicketPriority),
    status: z.nativeEnum(TicketStatus),
    clientName: z.string().min(1).max(100),
    clientId: z.string().uuid(),
});

export const updateTicketSchema = createTicketSchema.pick({
  title: true,
  description: true,
  priority: true,
  status: true,
}).partial();


export type CreateTicketDTO = z.infer<typeof createTicketSchema>;

export type UpdateTicketDTO = z.infer<typeof updateTicketSchema>;