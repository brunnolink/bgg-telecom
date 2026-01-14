
import { TicketPriority, TicketStatus } from "@prisma/client";
import { prisma } from "../../infra/prisma/prisma.client";
import { TicketEntity } from "./ticket-entity";
import { TicketRepository } from "./ticket-interface";
import { TicketMapper } from "./ticket-mapper";
import { AppError } from "../../errors/AppError";


export class PrismaTicketRepository implements TicketRepository {
    async findById(id: string): Promise<TicketEntity | null> {
        const ticket = await prisma.ticket.findUnique({ where: { id } });
        return ticket ? TicketMapper.toEntity(ticket) : null;
    }

    async create(ticket: TicketEntity): Promise<TicketEntity> {
        try {
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
        } catch (error) {
            console.log(error)
            if (error instanceof AppError) {
                throw error
            }
            throw new AppError("Error to create ticket", 500);
        }

    }

    async update(ticket: TicketEntity): Promise<TicketEntity> {
        try {
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
        } catch (error) {
            console.log(error)
            if (error instanceof AppError) {
                throw error
            }
            throw new AppError("Error to update ticket", 500);
        }

    }

    async list(params: {
        page: number;
        limit: number;
        status?: TicketStatus;
        priority?: TicketPriority;
        createdAt?: string;
    }): Promise<TicketEntity[]> {
        const page = Math.max(params.page, 1);
        const limit = Math.min(Math.max(params.limit, 1), 100);
        const skip = (page - 1) * limit;

        const tickets = await prisma.ticket.findMany({
            where: {
                ...(params.status ? { status: params.status } : {}),
                ...(params.priority ? { priority: params.priority } : {}),
                ...(params.createdAt ? {
                    createdAt: {
                        gte: new Date(new Date(params.createdAt).setHours(0, 0, 0, 0)),
                        lte: new Date(new Date(params.createdAt).setHours(23, 59, 59, 999)),
                    },
                } : {}),
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
}
