export type TicketStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  author: string;
  createdAt: string;  
};

export type CreateTicketPayload = {
  title: string;
  description: string;
  priority: TicketPriority;
};
 

export type UpdateTicketPayload = Partial<{
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
}>;