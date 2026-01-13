import { Router } from "express";
import { TicketController } from "./controllers/ticket-controller";
import { ensureAuthenticated } from "../../../singletons/middleware/ensure-authenticated";
import { ensureRoles } from "../../../singletons/middleware/ensure-role";



export const TicketRoute = Router();

const ticketController = new TicketController();

TicketRoute.post("/create-ticket", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.createTicket);

TicketRoute.put("/update-ticket/:id", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.updateTicket);

TicketRoute.get("/ticket/:id", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.getTicketById);

TicketRoute.get("/tickets", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.listTickets);

TicketRoute.delete("/delete-ticket/:id", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.deleteTicket);