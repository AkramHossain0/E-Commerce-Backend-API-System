import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userContact: {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'] 
    },
    phone: { 
      type: String, 
      required: true, 
      match: [/^\+?\d{10,15}$/, 'Please provide a valid phone number'] 
    },
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  shippingOptions: {
    method: { type: String, required: true },
    cost: { type: Number, required: true },
  },
  paymentOptions: {
    method: { type: String, required: true },
    transactionId: { type: String, required: true },
  },
  deliveryCharge: { 
    type: Number, 
    default: 0, 
  },
  orderStatus: { 
    type: String, 
    enum: ['invoice', 'pending', 'processing', 'delivered', 'cancelled'], 
    default: 'invoice',
  },  
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalPrice: {
    type: Number,
    required: true,
  }  
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
