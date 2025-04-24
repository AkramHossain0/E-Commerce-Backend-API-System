import User from "../model/auth.js";
import Product from "../model/product.js";
import Category from "../model/categories.js";
import Employee from "../model/emplayee.js";
import Order from "../model/order.js";


const getDashboardData = async (req, res) => {

    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const categoryCount = await Category.countDocuments();
        const employeeCount = await Employee.countDocuments();

        res.status(200).json({ userCount, productCount, categoryCount, employeeCount });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
  
};

const graficData = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const order = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    orderStatus: "delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};


export { getDashboardData, graficData };