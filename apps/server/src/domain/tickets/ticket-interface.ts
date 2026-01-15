import { TicketPriority, TicketStatus } from "@prisma/client";
import { TicketEntity } from "./ticket-entity";
import { ListTicketsRepoParams } from "./dtos/list-ticket-DTO";
import { CreateCommentDTO } from "./dtos/create-comment-DTO";

export interface TicketRepository {
    findById(id: string): Promise<TicketEntity | null>;
    create(ticket: TicketEntity): Promise<TicketEntity>;
    update(ticket: TicketEntity): Promise<TicketEntity>;
    ticketList(params: ListTicketsRepoParams): Promise<TicketEntity[]>;
    createTicketComment(data: CreateCommentDTO): Promise<any>;
    listCommentsByTicketId(ticketId: string): Promise<any[]>;
    deleteTicket(ticketId: string): Promise<void>;
}