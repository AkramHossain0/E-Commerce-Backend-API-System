import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import User from "../model/auth.js";
import { encryptAES } from "../libs/crypto.js";
import crypto from "crypto";

const validatePassword = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expirationTime = Date.now() + 5 * 60 * 1000;

    global.verificationCodes = global.verificationCodes || {};
    global.verificationCodes[email] = {
      code: verificationCode,
      name,
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
      subject: "Action Required: Verify Your Email Address",
      html: `
          <html>
            <body>
              <p>Hello,</p>
              <p>Thank you for creating an account with <strong>[Your Company Name]</strong>. To complete your registration, please enter the following verification code on the website:</p>
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
    console.error("Error during registration", error);
    res
      .status(500)
      .json({ success: false, error: "Error during registration" });
  }
};

const verify = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (
      global.verificationCodes &&
      global.verificationCodes[email]
    ) {
      const { code, expirationTime, name, hashedPassword } = global.verificationCodes[email];

      if (Date.now() > expirationTime) {
        delete global.verificationCodes[email];
        return res
          .status(400)
          .json({ success: false, message: "Verification code has expired" });
      }

      if (code === verificationCode) {
        delete global.verificationCodes[email];

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res
          .status(201)
          .json({
            success: true,
            message: "User registered successfully",
            user: newUser,
          });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Invalid verification code" });
      }
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }
  } catch (error) {
    console.error("Error during verification", error);
    res
      .status(500)
      .json({ success: false, error: "Error during verification" });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const sessionId = crypto.randomUUID();
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();

    const tokenData = JSON.stringify({
      uid: findUser._id,
      sid: sessionId,
      nonce: nonce,
      name: findUser.name,
      email: findUser.email,
      role: findUser.role,
      iat: timestamp,
      exp: Date.now() + 60 * 60 * 1000,
    });

    const secretKey = process.env.JWT_SECRET;
    const encrypted = encryptAES(tokenData, secretKey);

    res.cookie("token", JSON.stringify(encrypted), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 60 * 1000,
      signed: true,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: encrypted
    });
  } catch (error) {
    console.error("Error during login", error);
    res.status(500).json({ success: false, error: "Error during login" });
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

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = Date.now() + 5 * 60 * 1000;

    global.resetCodes = global.resetCodes || {};
    global.resetCodes[email] = { resetCode, expirationTime };

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
      subject: "Action Required: Reset Your Password",
      html: `
          <html>
            <body>
              <p>Hello,</p>
              <p>We received a request to reset the password for your account with <strong>[Your Company Name]</strong>.</p>
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
      global.resetCodes &&
      global.resetCodes[email]
    ) {
      const { resetCode: storedCode, expirationTime } = global.resetCodes[email];

      if (Date.now() > expirationTime) {
        delete global.resetCodes[email];
        return res.status(400).json({ success: false, message: "Reset code has expired" });
      }

      if (storedCode === resetCode) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        delete global.resetCodes[email];
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

const getUserdata = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const userId = req.user.uid;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user data"
    });
  }
};

const updateUserdata = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const userId = req.user.uid;
    const { name, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const updates = {};

    if (name) updates.name = name;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another account"
        });
      }
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updates provided"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });

  } catch (error) {
    console.error("Error updating user data:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user data"
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const userId = req.user.uid;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
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

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

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
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.error("Error during logout", error);
    res.status(500).json({ success: false, error: "Error during logout" });
  }
};
export {
  Register,
  Login,
  verify,
  forgotPassword,
  verifyResetCode,
  getUserdata,
  updateUserdata,
  updatePassword,
  logout
};