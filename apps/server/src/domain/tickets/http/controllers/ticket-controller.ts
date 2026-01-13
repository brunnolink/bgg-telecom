import { Request, Response } from "express"; 
import { TicketService } from "../../ticket-service";
import { makeTicketService } from "../../factories/make-ticket";

export class TicketController {
  private readonly service: TicketService;

  constructor() {
    this.service = makeTicketService();
  }

  createTicket = async (req: Request, res: Response) => {
    const ticket = await this.service.create(req.body);
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
    const ticket = await this.service.update(ticketId, req.body);
    return res.json(ticket);
  };

  deleteTicket = async (req: Request, res: Response) => {
    const ticketId = req.params.id as string;
    await this.service.deleteTicket(ticketId);
    return res.status(204).send();
  };
}
