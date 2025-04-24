import { decryptAES } from "../libs/crypto.js";

const algorithm = 'aes-256-gcm'; 

const checkUser = (req, res, next) => {
  try {
    const tokenCookie = req.signedCookies.token;
    
    if (!tokenCookie) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const encryptedData = JSON.parse(tokenCookie);
    const { iv, token, authTag } = encryptedData;
    
    const secretKey = process.env.JWT_SECRET;
    
    const decryptedData = decryptAES(token, secretKey, iv, authTag);
    const userData = JSON.parse(decryptedData);
    
    if (Date.now() > userData.exp) {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }

    req.user = userData;
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ 
      success: false, 
      message: "Authentication failed" 
    });
  }
};

export default checkUser;