import { TicketPriority, TicketStatus } from "@prisma/client";
import { TicketEntity } from "./ticket-entity";
import { ListTicketsRepoParams } from "./dtos/list-ticket-DTO";

export interface TicketRepository {
    findById(id: string): Promise<TicketEntity | null>;
    create(ticket: TicketEntity): Promise<TicketEntity>;
    update(ticket: TicketEntity): Promise<TicketEntity>;
    list(params: ListTicketsRepoParams): Promise<TicketEntity[]>;
    deleteTicket(ticketId: string): Promise<void>;
}