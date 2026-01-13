import { TicketPriority } from "@prisma/client";

export type CreateTicketDTO = {
    title: string;
    description: string;
    priority: TicketPriority;
    clientId: string;
};