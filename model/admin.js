import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    nid: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    }
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;