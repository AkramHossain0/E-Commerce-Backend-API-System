import express from "express";
import {
    addEmployee,
    deleteEmployee,
    updateEmployee,
    getEmployees,
    login,
    updatePassword
} from "../controllers/emplayee.js";
import checkAdmin from "../middleware/checkAdmin.js";

const emplayeeRouter = express.Router();

emplayeeRouter.post("/", checkAdmin, addEmployee);
emplayeeRouter.get("/", getEmployees);
emplayeeRouter.delete("/:id", checkAdmin, deleteEmployee);
emplayeeRouter.put("/:id", checkAdmin, updateEmployee);
emplayeeRouter.post("/login", login);
emplayeeRouter.put("/updatePassword/:id", updatePassword);

export default emplayeeRouter;