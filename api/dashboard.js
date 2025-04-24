import express from "express";
import { getDashboardData, graficData } from "../controllers/dashboard.js";
import checkAdminOrEmployee from "../middleware/checkAdminOrEmployee.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", checkAdminOrEmployee, getDashboardData);
dashboardRouter.get("/grafic", checkAdminOrEmployee, graficData);

export default dashboardRouter;