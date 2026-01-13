import { Router } from "express"
import { userRoute } from "../domain/user/http/routes"
import { TicketRoute } from "../domain/tickets/http/routes"

 
export const appRouter = Router()

appRouter.use('/users', userRoute)
appRouter.use('/tickets', TicketRoute)