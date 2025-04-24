import Admin from "../model/admin.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { encryptAES } from "../libs/crypto.js";
import crypto from "crypto";

const validatePassword = (password) => {
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, nid, address } = req.body;

        if (!name || !email || !password || !phone || !nid || !address) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character.",
            });
        }

        const existAdmin = await Admin.findOne({ email });

        if (existAdmin) {
            return res
                .status(400)
                .json({ success: false, message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();
        const expirationTime = Date.now() + 5 * 60 * 1000;

        global.adminVerificationCodes = global.adminVerificationCodes || {};
        global.adminVerificationCodes[email] = {
            code: verificationCode,
            name,
            phone,
            nid,
            address,
            hashedPassword,
            expirationTime,
        };

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Action Required: Verify Your Admin Account",
            html: `
            <html>
              <body>
                <p>Hello ${name},</p>
                <p>Thank you for creating an admin account with <strong>[Your Company Name]</strong>. To complete your registration, please enter the following verification code on the website:</p>
                <p style="font-size: 18px; font-weight: bold;">Verification Code: <span style="color: #007bff;">${verificationCode}</span></p>
                <p>This code will expire in 5 minutes. If you did not initiate this request, kindly ignore this email.</p>
                <p>Should you need any assistance, feel free to reach out to our support team at <a href="mailto:[Support Email]">[Support Email]</a>.</p>
                <p>Best regards,<br>The <strong>[Your Company Name]</strong> Team</p>
              </body>
            </html>
          `,
        };

        await transporter.sendMail(mailOptions);

        res
            .status(200)
            .json({ success: true, message: "Verification code sent to email" });
    } catch (error) {
        console.error("Error during admin registration", error);
        res
            .status(500)
            .json({ success: false, error: "Error during admin registration" });
    }
};

const verifyAdmin = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }

        if (
            global.adminVerificationCodes &&
            global.adminVerificationCodes[email]
        ) {
            const { code, expirationTime, name, phone, nid, address, hashedPassword } = global.adminVerificationCodes[email];

            if (Date.now() > expirationTime) {
                delete global.adminVerificationCodes[email];
                return res
                    .status(400)
                    .json({ success: false, message: "Verification code has expired" });
            }

            if (code === verificationCode) {
                delete global.adminVerificationCodes[email];

                const newAdmin = new Admin({
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    nid,
                    address
                });
                await newAdmin.save();

                res
                    .status(201)
                    .json({
                        success: true,
                        message: "Admin registered successfully",
                    });
            } else {
                res
                    .status(400)
                    .json({ success: false, message: "Invalid verification code" });
            }
        } else {
            res
                .status(400)
                .json({ success: false, message: "Invalid verification code or email" });
        }
    } catch (error) {
        console.error("Error during admin verification", error);
        res
            .status(500)
            .json({ success: false, error: "Error during admin verification" });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const findAdmin = await Admin.findOne({ email });

        if (!findAdmin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, findAdmin.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password" });
        }

        const sessionId = crypto.randomUUID();
        const nonce = crypto.randomBytes(16).toString('hex');
        const timestamp = Date.now().toString();

        const tokenData = JSON.stringify({
            uid: findAdmin._id,
            sid: sessionId,
            nonce: nonce,
            name: findAdmin.name,
            email: findAdmin.email,
            role: "admin",
            phone: findAdmin.phone,
            nid: findAdmin.nid,
            address: findAdmin.address,
            iat: timestamp,
            exp: Date.now() + 60 * 60 * 1000,
        });

        const secretKey = process.env.JWT_SECRET;
        const encrypted = encryptAES(tokenData, secretKey);

        res.cookie("admin_token", JSON.stringify(encrypted), {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 30 * 60 * 1000,
            signed: true,
        });

        res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            token: encrypted
        });
    } catch (error) {
        console.error("Error during admin login", error);
        res.status(500).json({ success: false, error: "Error during admin login" });
    }
};

const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("admin_token");
        res.status(200).json({ success: true, message: "Admin logged out successfully" });
    } catch (error) {
        console.error("Error during admin logout", error);
        res.status(500).json({ success: false, error: "Error during admin logout" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: "Email is required" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res
                .status(400)
                .json({ success: false, message: "Admin not found" });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expirationTime = Date.now() + 5 * 60 * 1000;

        global.adminResetCodes = global.adminResetCodes || {};
        global.adminResetCodes[email] = { resetCode, expirationTime };

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Action Required: Reset Your Admin Password",
            html: `
            <html>
              <body>
                <p>Hello ${admin.name},</p>
                <p>We received a request to reset the password for your admin account with <strong>[Your Company Name]</strong>.</p>
                <p>To reset your password, please use the following code:</p>
                <p style="font-size: 18px; font-weight: bold;">Reset Code: <span style="color: #007bff;">${resetCode}</span></p>
                <p>This code will expire in 5 minutes. If you did not request a password reset, please disregard this email and contact our support team immediately.</p>
                <p>If you need further assistance, feel free to reach out to our support team at <a href="mailto:[Support Email]">[Support Email]</a>.</p>
                <p>Best regards,<br>The <strong>[Your Company Name]</strong> Team</p>
              </body>
            </html>
          `,
        };

        await transporter.sendMail(mailOptions);

        res
            .status(200)
            .json({ success: true, message: "Password reset code sent to email" });
    } catch (error) {
        console.error("Error during forgot password", error);
        res
            .status(500)
            .json({ success: false, error: "Error during forgot password" });
    }
};

const verifyResetCode = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        if (!email || !resetCode || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character.",
            });
        }

        if (
            global.adminResetCodes &&
            global.adminResetCodes[email]
        ) {
            const { resetCode: storedCode, expirationTime } = global.adminResetCodes[email];

            if (Date.now() > expirationTime) {
                delete global.adminResetCodes[email];
                return res.status(400).json({ success: false, message: "Reset code has expired" });
            }

            if (storedCode === resetCode) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await Admin.findOneAndUpdate({ email }, { password: hashedPassword });
                delete global.adminResetCodes[email];
                return res.status(200).json({ success: true, message: "Password reset successfully" });
            } else {
                return res.status(400).json({ success: false, message: "Invalid reset code" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Invalid reset code" });
        }
    } catch (error) {
        console.error("Error during password reset", error);
        res.status(500).json({ success: false, error: "Error during password reset" });
    }
};

const getAdminData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const adminId = req.user.uid;

        const admin = await Admin.findById(adminId).select('-password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        return res.status(200).json({
            success: true,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                nid: admin.nid,
                address: admin.address,
                role: "admin"
            }
        });
    } catch (error) {
        console.error("Error fetching admin data:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching admin data"
        });
    }
};

const updateAdminData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const adminId = req.user.uid;
        const { name, email, phone, nid, address } = req.body;

        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const updates = {};

        if (name) updates.name = name;

        if (email && email !== admin.email) {
            const emailExists = await Admin.findOne({ email, _id: { $ne: adminId } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use by another account"
                });
            }
            updates.email = email;
        }

        if (phone) updates.phone = phone;
        if (nid) updates.nid = nid;
        if (address) updates.address = address;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No updates provided"
            });
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            updates,
            { new: true }
        ).select('-password');

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            admin: {
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                phone: updatedAdmin.phone,
                nid: updatedAdmin.nid,
                address: updatedAdmin.address
            }
        });

    } catch (error) {
        console.error("Error updating admin data:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating admin data"
        });
    }
};

const updateAdminPassword = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const adminId = req.user.uid;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await Admin.findByIdAndUpdate(adminId, { password: hashedPassword });

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating password"
        });
    }
};

export {
    registerAdmin,
    verifyAdmin,
    loginAdmin,
    logoutAdmin,
    forgotPassword,
    verifyResetCode,
    getAdminData,
    updateAdminData,
    updateAdminPassword
};
