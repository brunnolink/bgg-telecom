import { prisma } from "../../infra/prisma/prisma.client";
import { TicketEntity } from "./ticket-entity";
import { TicketRepository } from "./ticket-interface";
import { TicketMapper } from "./ticket-mapper";
import { AppError } from "../../errors/AppError";
import { ListTicketsRepoParams } from "./dtos/list-ticket-DTO";
import { CreateCommentDTO } from "./dtos/create-comment-DTO";


export class PrismaTicketRepository implements TicketRepository {
    async findById(id: string): Promise<TicketEntity | null> {
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        return ticket ? TicketMapper.toEntity(ticket) : null;
    }

    async create(ticket: TicketEntity): Promise<TicketEntity> {
        const created = await prisma.ticket.create({
            data: {
                id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                client_name: ticket.clientName,
                client: { connect: { id: ticket.clientId } },
            },
        });
        return TicketMapper.toEntity(created);
    }

    async update(ticket: TicketEntity): Promise<TicketEntity> {
        const updated = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                technicianId: ticket.technicianId ?? null,
            },
        });
        return TicketMapper.toEntity(updated);
    }

    async ticketList(params: ListTicketsRepoParams): Promise<TicketEntity[]> {

        const page = Math.max(params.page, 1);
        const limit = Math.min(Math.max(params.limit, 1), 100);
        const skip = (page - 1) * limit;

        const tickets = await prisma.ticket.findMany({
            where: {
                ...(params.clientId ? { clientId: params.clientId } : {}),
                ...(params.status ? { status: params.status } : {}),
                ...(params.priority ? { priority: params.priority } : {}),
                ...(params.createdAt
                    ? {
                        createdAt: {
                            gte: new Date(
                                new Date(params.createdAt).setHours(0, 0, 0, 0)
                            ),
                            lte: new Date(
                                new Date(params.createdAt).setHours(23, 59, 59, 999)
                            ),
                        },
                    }
                    : {}),
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        return tickets.map(TicketMapper.toEntity);
    }

    async deleteTicket(ticketId: string): Promise<void> {
        await prisma.ticket.delete({ where: { id: ticketId } });
    }

    async createTicketComment(data: CreateCommentDTO) {
        return await prisma.ticketComment.create({
            data: {
                ticketId: data.ticketId,
                authorId: data.authorId,
                message: data.message,
            },
            include: {
                author: { select: { id: true, name: true, role: true } },
            },
        });
    }

    async listCommentsByTicketId(ticketId: string) {
        return await prisma.ticketComment.findMany({
            where: { ticketId },
            orderBy: { createdAt: "asc" },
            include: {
                author: { select: { id: true, name: true, role: true } },
            },
        });
    }
}
