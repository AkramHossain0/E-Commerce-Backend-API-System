import express from 'express';
import {createCategory, getCategories, updateCategory, deleteCategory} from '../controllers/categories.js';
import checkAdminOrEmployee from '../middleware/checkAdminOrEmployee.js';

const categoriesRouter = express.Router();

categoriesRouter.get("/", getCategories);
categoriesRouter.post("/",checkAdminOrEmployee, createCategory);
categoriesRouter.put("/:id",checkAdminOrEmployee, updateCategory);
categoriesRouter.delete("/:id",checkAdminOrEmployee, deleteCategory);

export default categoriesRouter;
