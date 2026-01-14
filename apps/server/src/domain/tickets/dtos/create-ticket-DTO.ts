import { TicketPriority, TicketStatus } from "@prisma/client";

export type CreateTicketDTO = {
    title: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    clientName: string;
    clientId: string;
};

export type UpdateTicketDTO = Partial<Pick<CreateTicketDTO, 'title' | 'description' | 'priority' | 'status'>>;