import { TicketPriority, TicketStatus } from "@prisma/client";
import { TicketEntity } from "./ticket-entity";

export interface TicketRepository {
    findById(id: string): Promise<TicketEntity | null>;
    create(ticket: TicketEntity): Promise<TicketEntity>;
    update(ticket: TicketEntity): Promise<TicketEntity>;
    list(params: {
        page: number;
        limit: number;
        status?: TicketStatus;
        priority?: TicketPriority;
        createdAt?: string;
    }): Promise<TicketEntity[]>;
    deleteTicket(ticketId: string): Promise<void>;
}