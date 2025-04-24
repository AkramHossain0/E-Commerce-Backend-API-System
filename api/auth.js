import express from 'express';
import {
    Register,
    Login,
    verify,
    forgotPassword,
    verifyResetCode,
    getUserdata,
    updateUserdata,
    updatePassword,
    logout
} from '../controllers/auth.js';
import checkUser from '../middleware/checkUser.js';

const AuthRouter = express.Router();

AuthRouter.post('/register', Register);
AuthRouter.post('/login', Login);
AuthRouter.post('/verify', verify);
AuthRouter.post('/forgot', forgotPassword);
AuthRouter.post('/verifyResetCode', verifyResetCode);
AuthRouter.get('/user', checkUser, getUserdata);
AuthRouter.put('/user', checkUser, updateUserdata);
AuthRouter.put('/password', checkUser, updatePassword);
AuthRouter.post('/logout', checkUser, logout);

export default AuthRouter;