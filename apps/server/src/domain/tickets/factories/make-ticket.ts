 
import { PrismaTicketRepository } from "../ticket-repository";
import { TicketService } from "../ticket-service";

export function makeTicketService() {
  const repo = new PrismaTicketRepository();
  return new TicketService(repo);
}