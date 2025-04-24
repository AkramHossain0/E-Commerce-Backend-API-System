import { decryptAES } from "../libs/crypto.js";

const algorithm = 'aes-256-gcm';

const checkEmployee = (req, res, next) => {
  try {
    const tokenCookie = req.signedCookies.employee_token;
    
    if (!tokenCookie) {
      return res.status(401).json({ 
        success: false, 
        message: "Employee authentication required" 
      });
    }

    const encryptedData = JSON.parse(tokenCookie);
    const { iv, token, authTag } = encryptedData;
    
    const secretKey = process.env.JWT_SECRET;
    
    const decryptedData = decryptAES(token, secretKey, iv, authTag);
    const employeeData = JSON.parse(decryptedData);
    
    if (Date.now() > employeeData.exp) {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }

    if (employeeData.role !== "employee") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized as an employee" 
      });
    }

    req.employee = employeeData;
    
    next();
  } catch (error) {
    console.error("Employee authentication error:", error);
    res.status(401).json({ 
      success: false, 
      message: "Employee authentication failed" 
    });
  }
};

export default checkEmployee;