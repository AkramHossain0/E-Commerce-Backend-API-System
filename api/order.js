import express from 'express';
import {createOrder, getOrders, getOrderById, updateOrderStatus} from '../controllers/order.js';
import checkAdminOrEmployee from '../middleware/checkAdminOrEmployee.js';

const oderRouter = express.Router();

oderRouter.post("/", createOrder);
oderRouter.get("/", getOrders);
oderRouter.get("/:id", getOrderById);
oderRouter.put("/:id",checkAdminOrEmployee, updateOrderStatus);

export default oderRouter;
