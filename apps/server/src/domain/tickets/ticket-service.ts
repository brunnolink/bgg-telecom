import { randomUUID } from "crypto";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { AppError } from "../../errors/AppError";
import { TicketEntity } from "./ticket-entity";
import { TicketRepository } from "./ticket-interface";
import { CreateTicketDTO } from "./dtos/create-ticket-DTO";
import { UserRepository } from "../user/user-interface";

export class TicketService {
  constructor(private readonly repo: TicketRepository) { }

  async create(data: CreateTicketDTO) {
    const ticket = new TicketEntity(
      randomUUID(),
      data.title,
      data.description,
      data.clientName,
      TicketStatus.OPEN,
      data.priority,
      data.clientId
    );

    return this.repo.create(ticket);
  }

  async update(id: string, data: Partial<CreateTicketDTO>, role: "CLIENT" | "TECH") {
    const ticket = await this.repo.findById(id);
    if (!ticket) throw new AppError("Ticket not found", 404);

    if (!ticket.canEdit()) throw new Error("Ticket finished cannot be edited");

    if (data.title !== undefined) ticket.title = data.title;
    if (data.description !== undefined) ticket.description = data.description;
    if (data.priority !== undefined) ticket.priority = data.priority;
    if (data.status !== undefined) ticket.status = data.status;

    if (data.status !== undefined) {
      if (role !== "TECH") throw new AppError("Only TECH can change ticket status", 403);
      ticket.status = data.status;
    }


    return this.repo.update(ticket);
  }

  async assignToTechnician(ticketId: string, technicianId: string) {
    const ticket = await this.repo.findById(ticketId);
    if (!ticket) throw new AppError("Ticket not found", 404);
 
    if (ticket.technicianId) {
      throw new AppError("Ticket already assigned", 409);
    }
 
    ticket.technicianId = technicianId;
    ticket.status = TicketStatus.IN_PROGRESS;  

    return this.repo.update(ticket);
  }

  async getTicketById(id: string) {
    const ticket = await this.repo.findById(id);
    if
      (!ticket) throw new AppError("Ticket not found", 404);
    return ticket;
  }

  async list(query: { page?: any; limit?: any; status?: any; priority?: any, createdAt?: any }) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    return this.repo.list({ page, limit, status: query.status, priority: query.priority, createdAt: query.createdAt });
  }

  async deleteTicket(ticketId: string): Promise<void> {
    const ticket = await this.repo.findById(ticketId);
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }
    await this.repo.deleteTicket(ticketId);
  }
}
