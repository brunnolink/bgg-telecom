import { Ticket } from "@prisma/client";
import { TicketEntity } from "./ticket-entity";

export const TicketMapper = {
    toEntity(db: Ticket) {
        return new TicketEntity(
            db.id,
            db.title,
            db.description,
            db.client_name,
            db.status,
            db.priority,
            db.clientId,
            db.technicianId ?? undefined,
        );
    },
};
