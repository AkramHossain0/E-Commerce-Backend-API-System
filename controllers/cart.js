import Cart from "../model/cart.js";

const addToCart = async (req, res) => {
    try{
        const { cartItems, totalPrice } = req.body;
        const cart = new Cart({
            user: req.user._id,
            cartItems,
            totalPrice
        });
        await cart.save();
        res.status(201).json(cart);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};

const getCart = async (req, res) => {
    try{
        const cart = await Cart.find({ user: req.user._id });
        res.json(cart);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};

const updateCart = async (req, res) => {
    try{
        const { cartItems, totalPrice } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if(cart){
            cart.cartItems = cartItems;
            cart.totalPrice = totalPrice;
            await cart.save();
            res.json(cart);
        }
        else{
            res.status(404).json({ message: "Cart not found" });
        }
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};

const deleteCart = async (req, res) => {
    try{
        const cart = await Cart.findOne({ user: req.user._id });
        if(cart){
            await cart.remove();
            res.json({ message: "Cart removed" });
        }
        else{
            res.status(404).json({ message: "Cart not found" });
        }
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};

export { addToCart, getCart, updateCart, deleteCart };
    