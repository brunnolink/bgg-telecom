import { randomUUID } from "crypto";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { AppError } from "../../errors/AppError";
import { TicketEntity } from "./ticket-entity";
import { TicketRepository } from "./ticket-interface";
import { CreateTicketDTO } from "./dtos/create-ticket-DTO";

export class TicketService {
  constructor(private readonly repo: TicketRepository) { }

  async create(data:CreateTicketDTO) {
    const ticket = new TicketEntity(
      randomUUID(),
      data.title,
      data.description,
      TicketStatus.OPEN,
      data.priority,
      data.clientId
    );

    return this.repo.create(ticket);
  }

  async update(id: string, data: Partial<Pick<TicketEntity, "title" | "description" | "priority">>) {
    const ticket = await this.repo.findById(id);
    if (!ticket) throw new AppError("Ticket not found", 404);

    if (!ticket.canEdit()) throw new Error("Ticket finished cannot be edited");

    if (data.title !== undefined) ticket.title = data.title;
    if (data.description !== undefined) ticket.description = data.description;
    if (data.priority !== undefined) ticket.priority = data.priority;

    return this.repo.update(ticket);
  }

  async getTicketById(id: string) {
    const ticket = await this.repo.findById(id);
    if
      (!ticket) throw new AppError("Ticket not found", 404);
    return ticket;
  }

  async list(query: { page?: any; limit?: any; status?: any; priority?: any }) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    return this.repo.list({ page, limit, status: query.status, priority: query.priority });
  }

  async deleteTicket(ticketId: string): Promise<void> {
    const ticket = await this.repo.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }
    await this.repo.deleteTicket(ticketId);
  }
}
