import Product from "../model/product.js";

const createProduct = async (req, res) => {
  try {

    const{name, description, price, countInStock, category, imageUrl} = req.body;

    const product = new Product({
        name,
        description,
        price,
        countInStock,
        category,
        imageUrl,
        });

    await product.save();
    res.send(product);

  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
    };

const updateProduct = async (req, res) => {
    try {
        const {name, description, price, countInStock, category, imageUrl} = req.body;
        const product = await Product.findById(req.params.id);
        if(product){
            product.name = name;
            product.description = description;
            product.price = price;
            product.countInStock = countInStock;
            product.category = category;
            product.imageUrl = imageUrl;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const deleteProduct = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export {createProduct, getProducts, updateProduct, deleteProduct};