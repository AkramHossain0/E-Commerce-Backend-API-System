import Employee from "../model/emplayee.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { encryptAES } from "../libs/crypto.js";

const addEmployee = async (req, res) => {
  try {
    const { name, position, salary, email, phone, address, photo } = req.body;

    let photoBuffer = null;
    if (photo) {
      photoBuffer = Buffer.from(photo, 'base64');
    }

    const newEmployee = new Employee({
      name,
      position,
      salary,
      email,
      phone,
      address,
      photo: photoBuffer,
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong while adding the employee." });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.findByIdAndDelete(id);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, salary, email, phone, address, photo } = req.body;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { name, position, salary, email, phone, address, photo },
      { new: true }
    );
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const sessionId = crypto.randomUUID();
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();

    const tokenData = JSON.stringify({
      uid: employee._id,
      sid: sessionId,
      nonce: nonce,
      name: employee.name,
      email: employee.email,
      position: employee.position,
      role: "employee",
      iat: timestamp,
      exp: Date.now() + 60 * 60 * 1000,
    });

    const secretKey = process.env.JWT_SECRET;
    const encrypted = encryptAES(tokenData, secretKey);

    res.cookie("employee_token", JSON.stringify(encrypted), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 60 * 1000,
      signed: true,
    });

    res.status(200).json({
      success: true,
      message: "Employee logged in successfully",
      token: encrypted
    });
  } catch (error) {
    console.error("Error during employee login", error);
    res.status(500).json({ success: false, error: "Error during employee login" });
  }
};

const validatePassword = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const updatePassword = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const employeeId = req.employee.uid;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, employee.password);
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

    await Employee.findByIdAndUpdate(employeeId, { password: hashedPassword });

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
  addEmployee, 
  deleteEmployee, 
  updateEmployee, 
  getEmployees, 
  login, 
  updatePassword 
};