import { Request, Response } from "express";
import { TicketService } from "../../ticket-service";
import { makeTicketService } from "../../factories/make-ticket";

export class TicketController {
  private readonly service: TicketService;

  constructor() {
    this.service = makeTicketService();
  }

  createTicket = async (req: Request, res: Response) => {
    const { title, description, priority, clientName } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    // console.log("requser:", req.user);
    const userId = req.user.id;

    const ticket = await this.service.create({
      title,
      description,
      priority,
      status: "OPEN",
      clientName: clientName,
      clientId: userId,
    });
    return res.status(201).json(ticket);
  };

  getTicketById = async (req: Request, res: Response) => {
    const ticketId = req.params.id as string;
    const ticket = await this.service.getTicketById(ticketId);
    return res.json(ticket);
  };

  listTickets = async (req: Request, res: Response) => {
    const tickets = await this.service.list(req.query);
    return res.json(tickets);
  };

  updateTicket = async (req: Request, res: Response) => {
    const ticketId = req.params.id as string;
    const { title, description, priority, status } = req.body;

    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const role = req.user.role;

    const payload: any = { title, description, priority };

    if (role === "TECH") {
      payload.status = status;
    }

    const ticket = await this.service.update(ticketId, payload, req.user.role);
    return res.json(ticket);
  };

  assignTicket = async (req: Request, res: Response) => {
    const ticketId = req.params.id as string;

    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    
    if (req.user.role !== "TECH")
      return res.status(403).json({ message: "Only TECH can assign tickets" });

    const techId = req.user.id;

    const updated = await this.service.assignToTechnician(ticketId, techId);
    return res.json(updated);
  };

  deleteTicket = async (req: Request, res: Response) => {
    const ticketId = req.params.id as string;
    await this.service.deleteTicket(ticketId);
    return res.status(204).send();
  };
}
