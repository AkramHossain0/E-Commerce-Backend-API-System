import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/cart.js";
import checkUser from "../middleware/checkUser.js";

const cartRouter = express.Router();

cartRouter.get("/", checkUser, getCategories);
cartRouter.post("/", checkUser, createCategory);
cartRouter.put("/:id", checkUser, updateCategory);
cartRouter.delete("/:id", checkUser, deleteCategory);

export default cartRouter;
