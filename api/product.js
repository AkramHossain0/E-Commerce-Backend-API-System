import express from "express";
import {createProduct, getProducts, updateProduct, deleteProduct} from "../controllers/product.js";
import checkAdminOrEmployee from "../middleware/checkAdminOrEmployee.js";

const productRouter = express.Router();

productRouter.get("/", getProducts);

productRouter.post("/",checkAdminOrEmployee, createProduct);
productRouter.put("/:id",checkAdminOrEmployee, updateProduct);
productRouter.delete("/:id",checkAdminOrEmployee, deleteProduct);

export default productRouter;

