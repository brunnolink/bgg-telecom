 
import { PrismaUserRepository } from "../../user/user-repository";
import { PrismaTicketRepository } from "../ticket-repository";
import { TicketService } from "../ticket-service";

export function makeTicketService() { 
  const ticketRepo = new PrismaTicketRepository();
  return new TicketService(ticketRepo);
}