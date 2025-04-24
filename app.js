import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './libs/db.js';
import authRouter from './api/auth.js';
import productRouter from './api/product.js';
import categoriesRouter from './api/categories.js';
import dashboardRouter from './api/dashboard.js';
import emplayeeRouter from './api/emplayee.js';
import oderRouter from './api/order.js';
import adminRouter from './api/admin.js';

dotenv.config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;
const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

const corsOptions = {
  origin: true,
  credentials: true
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Welcome to the homepage');
});


// api routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/employees', emplayeeRouter);
app.use('/api/orders', oderRouter);
app.use('/api/admin', adminRouter);


app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});