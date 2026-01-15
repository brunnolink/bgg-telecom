import { Router } from "express";
import { UserController } from "./controllers/user-controller";
import { ensureAuthenticated } from "../../../singletons/middleware/ensure-authenticated";
import { ensureRoles } from "../../../singletons/middleware/ensure-role";
import { AuthController } from "./controllers/auth-controller";

const user = new UserController()
const auth = new AuthController()

export const userRoute = Router();

userRoute.post("/create-user", user.createUser);

userRoute.post("/auth", auth.login);

userRoute.get("/:id", ensureAuthenticated, ensureRoles(["TECH"]), user.getUserById);

userRoute.get("/user-list", ensureAuthenticated, ensureRoles(["TECH"]), user.list);

userRoute.put("/update-user/:id", ensureAuthenticated, ensureRoles(["TECH", "CLIENT"]),  user.updateUser);