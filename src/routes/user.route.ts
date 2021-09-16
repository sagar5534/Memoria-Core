import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const userRoutes = Router();
const userController = new UserController();

userRoutes.get("/", userController.index);

export default userRoutes;
