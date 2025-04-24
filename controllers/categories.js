import mongoose from "mongoose";
import Category from "../model/categories.js";

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const category = new Category({ name, description, image });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send(`No category with id: ${id}`);
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, image },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send(`No category with id: ${id}`);
    }
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createCategory, getCategories, updateCategory, deleteCategory };
