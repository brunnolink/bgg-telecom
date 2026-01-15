import { Request, Response } from "express";
import { TicketService } from "../../ticket-service";
import { makeTicketService } from "../../factories/make-ticket";
import { AppError } from "../../../../errors/AppError";

export class TicketController {
  private readonly service: TicketService;

  constructor() {
    this.service = makeTicketService();
  }

  createTicket = async (req: Request, res: Response) => {
    try {
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

    } catch (error) {
      console.error("Error creating ticket:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  getTicketById = async (req: Request, res: Response) => {
    try {
      const ticketId = req.params.id as string;
      const ticket = await this.service.getTicketById(ticketId);
      return res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  listTickets = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const page = Math.max(Number(req.query.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);

      const tickets = await this.service.list({
        page,
        limit,
        status: req.query.status as any,
        priority: req.query.priority as any,
        createdAt: req.query.createdAt as any,
        userId: req.user.id,
        role: req.user.role,
      });

      return res.json(tickets);
    } catch (error) {
      console.error("Error listing tickets:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

  };

  updateTicket = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
      console.error("Error updating ticket:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  assignTicket = async (req: Request, res: Response) => {
    try {
      const ticketId = req.params.id as string;

      if (!req.user) return res.status(401).json({ message: "Not authenticated" });

      if (req.user.role !== "TECH")
        return res.status(403).json({ message: "Only TECH can assign tickets" });

      const techId = req.user.id;

      const updated = await this.service.assignToTechnician(ticketId, techId);
      return res.json(updated);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  deleteTicket = async (req: Request, res: Response) => {
    try {
      const ticketId = req.params.id as string;
      await this.service.deleteTicket(ticketId);
      return res.status(204).send();

    } catch (error) {
      console.error("Error deleting ticket:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  listTicketComments = async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Not authenticated" });

      const ticketId = req.params.id as string;
      const userId = req.user.id;
      const role = req.user.role;

      const comments = await this.service.listTicketComments(ticketId, userId, role);
      return res.json(comments);
    } catch (error) {
      console.log(error);
      throw new AppError("Error to list comments", 500);
    }
  };

  createTicketComment = async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Not authenticated" });

      const ticketId = req.params.id as string;
      const userId = req.user.id;
      const role = req.user.role;

      const { message } = req.body;

      const comment = await this.service.createTicketComment(ticketId, userId, role, message);
      return res.status(201).json(comment);

    } catch (error) {
      console.log(error);
      throw new AppError("Error to create comment", 500);
    }
  };
}
