import { describe, it, expect, vi, beforeEach } from "vitest";
import { TicketStatus } from "@prisma/client";
import { TicketEntity } from "../ticket-entity";
import { AppError } from "../../../errors/AppError";
import { TicketRepository } from "../ticket-interface";
import { TicketService } from "../ticket-service";


function makeTicketStub(overrides?: Partial<TicketEntity>) {
    const base: any = {
        id: "ticket-1",
        title: "Titulo",
        description: "Desc",
        clientName: "Cliente",
        status: TicketStatus.OPEN,
        priority: "MEDIUM",
        clientId: "client-1",
        technicianId: undefined,
        canEdit: () => true,
    };

    return { ...base, ...(overrides ?? {}) } as TicketEntity;
}

describe("TicketService", () => {
    let repo: TicketRepository;
    let service: TicketService;

    beforeEach(() => {
        repo = {
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            list: vi.fn(),
            deleteTicket: vi.fn(),
        } as unknown as TicketRepository;

        service = new TicketService(repo);
        vi.restoreAllMocks();
    });

    describe("create", () => {
        it("must create a ticket with status OPEN and call repo.create.", async () => {
            (repo.create as any).mockImplementation(async (t: TicketEntity) => t);

            const input = {
                title: "Bug no sistema",
                description: "Não carrega",
                clientName: "Brunno",
                priority: "HIGH",
                clientId: "client-123",
            } as any;

            const result = await service.create(input);

            expect(repo.create).toHaveBeenCalledTimes(1);
            const createdArg = (repo.create as any).mock.calls[0][0] as TicketEntity;

            expect(createdArg.title).toBe(input.title);
            expect(createdArg.description).toBe(input.description);
            expect(createdArg.clientName).toBe(input.clientName);
            expect(createdArg.clientId).toBe(input.clientId);
            expect(createdArg.priority).toBe(input.priority);
            expect(createdArg.status).toBe(TicketStatus.OPEN);

            expect(result.status).toBe(TicketStatus.OPEN);
        });
    });

    describe("update", () => {
        it("should throw a 404 error if the ticket does not exist.", async () => {
            (repo.findById as any).mockResolvedValue(null);

            await expect(
                service.update("not-found", { title: "x" }, "TECH")
            ).rejects.toBeInstanceOf(AppError);

            await expect(
                service.update("not-found", { title: "x" }, "TECH")
            ).rejects.toMatchObject({ message: "Ticket not found", statusCode: 404 });
        });

        it("should throw an error if the ticket cannot be edited (canEdit false).", async () => {
            (repo.findById as any).mockResolvedValue(
                makeTicketStub({ canEdit: () => false })
            );

            await expect(
                service.update("ticket-1", { title: "Novo" }, "TECH")
            ).rejects.toBeInstanceOf(Error);
        });

        it("CLIENT cannot change status (403)", async () => {
            (repo.findById as any).mockResolvedValue(makeTicketStub());
            (repo.update as any).mockImplementation(async (t: TicketEntity) => t);

            await expect(
                service.update("ticket-1", { status: TicketStatus.IN_PROGRESS } as any, "CLIENT")
            ).rejects.toBeInstanceOf(AppError);

            await expect(
                service.update("ticket-1", { status: TicketStatus.IN_PROGRESS } as any, "CLIENT")
            ).rejects.toMatchObject({ message: "Only TECH can change ticket status", statusCode: 403 });

            expect(repo.update).not.toHaveBeenCalled();
        });

        it("TECH can change status and update in the repo.", async () => {
            const ticket = makeTicketStub({ status: TicketStatus.OPEN });
            (repo.findById as any).mockResolvedValue(ticket);
            (repo.update as any).mockImplementation(async (t: TicketEntity) => t);

            const updated = await service.update(
                "ticket-1",
                {
                    title: "Novo título",
                    description: "Nova desc",
                    priority: "LOW",
                    status: TicketStatus.IN_PROGRESS,
                } as any,
                "TECH"
            );

            expect(repo.update).toHaveBeenCalledTimes(1);

            const arg = (repo.update as any).mock.calls[0][0] as TicketEntity;
            expect(arg.title).toBe("Novo título");
            expect(arg.description).toBe("Nova desc");
            expect(arg.priority).toBe("LOW");
            expect(arg.status).toBe(TicketStatus.IN_PROGRESS);

            expect(updated.status).toBe(TicketStatus.IN_PROGRESS);
        });
    });

    describe("assignToTechnician", () => {
        it("Should throw a 404 error if the ticket does not exist.", async () => {
            (repo.findById as any).mockResolvedValue(null);

            await expect(
                service.assignToTechnician("ticket-x", "tech-1")
            ).rejects.toMatchObject({ message: "Ticket not found", statusCode: 404 });
        });

        it("should throw a 409 error if the ticket has already been assigned.", async () => {
            (repo.findById as any).mockResolvedValue(
                makeTicketStub({ technicianId: "tech-old" })
            );

            await expect(
                service.assignToTechnician("ticket-1", "tech-1")
            ).rejects.toMatchObject({ message: "Ticket already assigned", statusCode: 409 });

            expect(repo.update).not.toHaveBeenCalled();
        });

        it("Should assign a technicianId and change the status to IN_PROGRESS.", async () => {
            const ticket = makeTicketStub({ technicianId: undefined, status: TicketStatus.OPEN });
            (repo.findById as any).mockResolvedValue(ticket);
            (repo.update as any).mockImplementation(async (t: TicketEntity) => t);

            const result = await service.assignToTechnician("ticket-1", "tech-1");

            expect(repo.update).toHaveBeenCalledTimes(1);
            const arg = (repo.update as any).mock.calls[0][0] as TicketEntity;

            expect(arg.technicianId).toBe("tech-1");
            expect(arg.status).toBe(TicketStatus.IN_PROGRESS);

            expect(result.status).toBe(TicketStatus.IN_PROGRESS);
        });
    });

    describe("getTicketById", () => {
        it("should return a ticket if it exists.", async () => {
            const ticket = makeTicketStub();
            (repo.findById as any).mockResolvedValue(ticket);

            const result = await service.getTicketById("ticket-1");
            expect(result.id).toBe("ticket-1");
        });

        it("Should throw a 404 error if it doesn't exist.", async () => {
            (repo.findById as any).mockResolvedValue(null);

            await expect(service.getTicketById("x")).rejects.toMatchObject({
                message: "Ticket not found",
                statusCode: 404,
            });
        });
    });

    describe("list", () => {
        it("CLIENT should filter by clientId.", async () => {
            (repo.list as any).mockResolvedValue([]);

            await service.list({
                page: 1,
                limit: 5,
                userId: "client-123",
                role: "CLIENT",
                status: undefined,
                priority: undefined,
                createdAt: undefined,
            } as any);

            expect(repo.list).toHaveBeenCalledTimes(1);
            const arg = (repo.list as any).mock.calls[0][0];
            expect(arg.clientId).toBe("client-123");
        });

        it("TECH should not filter by clientId.", async () => {
            (repo.list as any).mockResolvedValue([]);

            await service.list({
                page: 1,
                limit: 5,
                userId: "tech-123",
                role: "TECH",
                status: undefined,
                priority: undefined,
                createdAt: undefined,
            } as any);

            const arg = (repo.list as any).mock.calls[0][0];
            expect(arg.clientId).toBeUndefined();
        });
    });

    describe("deleteTicket", () => {
        it("should throw a 404 error if the ticket does not exist.", async () => {
            (repo.findById as any).mockResolvedValue(null);

            await expect(service.deleteTicket("x")).rejects.toMatchObject({
                message: "Ticket not found",
                statusCode: 404,
            });

            expect(repo.deleteTicket).not.toHaveBeenCalled();
        });

        it("should call repo.deleteTicket if it exists.", async () => {
            (repo.findById as any).mockResolvedValue(makeTicketStub());
            (repo.deleteTicket as any).mockResolvedValue(undefined);

            await service.deleteTicket("ticket-1");

            expect(repo.deleteTicket).toHaveBeenCalledTimes(1);
            expect(repo.deleteTicket).toHaveBeenCalledWith("ticket-1");
        });
    });
});