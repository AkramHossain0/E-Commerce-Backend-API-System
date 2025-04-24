import Order from "../model/order.js";

const createOrder = async (req, res) => {
    try {
        const order = new Order({
            userContact: req.body.userContact,
            shippingAddress: req.body.shippingAddress,
            shippingOptions: req.body.shippingOptions,
            paymentOptions: req.body.paymentOptions,
            deliveryCharge: req.body.deliveryCharge,
            items: req.body.items,
            totalPrice: req.body.totalPrice 
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getOrders = async (req, res) => {
    try{
        const orders = await Order.find();
        res.status(200).json(orders);
    }
    catch(error){
        res.status(500).json({message: "Internal server error"});
    }
}

const getOrderById = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id);
        if(order){
            res.status(200).json(order);
        }
        else{
            res.status(404).json({message: "Order not found"});
        }
    }
    catch(error){
        res.status(500).json({message: "Internal server error"});
    }
}

const updateOrderStatus = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id);
        if(order){
            order.orderStatus = req.body.orderStatus;
            const updatedOrder = await order.save();
            res.status(200).json(updatedOrder);
        }
        else{
            res.status(404).json({message: "Order not found"});
        }
    }
    catch(error){
        res.status(500).json({message: "Internal server error"});
    }
}

export { createOrder, getOrders, getOrderById, updateOrderStatus };