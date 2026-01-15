import { Router } from "express";
import { TicketController } from "./controllers/ticket-controller";
import { ensureAuthenticated } from "../../../singletons/middleware/ensure-authenticated";
import { ensureRoles } from "../../../singletons/middleware/ensure-role";



export const ticketRoute = Router();

const ticketController = new TicketController();

ticketRoute.post("/create-ticket", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.createTicket);
 
ticketRoute.post(
  "/create-comments/:id",
  ensureAuthenticated,
  ensureRoles(["TECH", "CLIENT"]),
  ticketController.createTicketComment
);

ticketRoute.put("/update-ticket/:id", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.updateTicket);

ticketRoute.patch(
  "/assign/:id",
  ensureAuthenticated,
  ensureRoles(["TECH"]),
  ticketController.assignTicket
);

ticketRoute.get(
  "/:id/comments",
  ensureAuthenticated,
  ensureRoles(["TECH", "CLIENT"]),
  ticketController.listTicketComments
);

ticketRoute.get("/ticket/:id", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.getTicketById);

ticketRoute.get("/list", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.listTickets);

ticketRoute.delete("/delete-ticket/:id", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]), ticketController.deleteTicket);