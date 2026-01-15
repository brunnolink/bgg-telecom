export type TicketStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  clientName: string;
  technicianId?: string | null;
  createdAt: string;
};

export type CreateTicketPayload = {
  title: string;
  description: string;
  priority: TicketPriority;
  clientName: string;
};


export type UpdateTicketPayload = Partial<{
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
}>;

export type TicketComment = {
  id: string;
  message: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: "CLIENT" | "TECH";
  };
};