import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true });

const User = mongoose.model("user", UserSchema);

export default User;