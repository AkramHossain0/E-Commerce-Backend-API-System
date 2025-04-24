import checkAdmin from "./checkAdmin.js";
import checkEmployee from "./checkEmplotee.js";

const checkAdminOrEmployee = (req, res, next) => {
  checkAdmin(req, res, (adminErr) => {
    if (!adminErr) {
      return next();
    }
    
    checkEmployee(req, res, (employeeErr) => {
      if (!employeeErr) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: "Access denied: requires admin or employee privileges"
      });
    });
  });
};

export default checkAdminOrEmployee;