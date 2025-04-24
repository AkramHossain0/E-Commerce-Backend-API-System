import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    countInStock: {
        type: Number,
    },
    category: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
});
const Product = mongoose.model('product', ProductSchema);
export default Product;