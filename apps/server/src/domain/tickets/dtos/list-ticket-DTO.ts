import { TicketPriority, TicketStatus } from "@prisma/client";

export type ListTicketsRepoParams = {
  page: number;
  limit: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  createdAt?: string;
  clientId?: string;  
};

export type ListTicketsServiceParams = {
  page: number;
  limit: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  createdAt?: string;
  userId: string;
  role: "CLIENT" | "TECH";
};