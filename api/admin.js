import express from 'express';
import {
    registerAdmin,
    verifyAdmin,
    loginAdmin,
    logoutAdmin,
    forgotPassword,
    verifyResetCode,
    getAdminData,
    updateAdminData,
    updateAdminPassword
} from '../controllers/admin.js';
import checkAdmin from '../middleware/checkAdmin.js';

const adminRouter = express.Router();

adminRouter.post('/register', registerAdmin);
adminRouter.post('/verify', verifyAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/logout', logoutAdmin);
adminRouter.post('/forgot', forgotPassword);
adminRouter.post('/reset', verifyResetCode);

adminRouter.get('/profile', checkAdmin, getAdminData);
adminRouter.put('/profile', checkAdmin, updateAdminData);
adminRouter.put('/password', checkAdmin, updateAdminPassword);

export default adminRouter;