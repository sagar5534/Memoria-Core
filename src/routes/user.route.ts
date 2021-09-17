import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const userRoutes = Router();
const userController = new UserController();

userRoutes.get("/", userController.index);
userRoutes.get("/:id", userController.find);
userRoutes.post("/", userController.create);
userRoutes.put("/:id", userController.update);
userRoutes.delete("/:id", userController.delete);

export default userRoutes;
