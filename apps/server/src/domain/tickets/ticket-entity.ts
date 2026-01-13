import { TicketPriority, TicketStatus } from "@prisma/client";

export class TicketEntity {
    constructor(
        public readonly id: string,
        public title: string,
        public description: string,
        public status: TicketStatus,
        public priority: TicketPriority,
        public clientId: string,
        public technicianId?: string
    ) { }

    canEdit(): boolean {
        return this.status !== TicketStatus.DONE;
    }

    startProgress() {
        if (this.status !== TicketStatus.OPEN) {
            throw new Error("Ticket cannot be started");
        }
        this.status = TicketStatus.IN_PROGRESS;
    }

    finish() {
        if (this.status === TicketStatus.DONE) {
            throw new Error("Ticket already finished");
        }
        this.status = TicketStatus.DONE;
    }
}