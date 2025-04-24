import Employee from "../model/emplayee.js";

const checkAdmin = async (req, res, next) => {
  try{

    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (employee.position === "admin") {
        next();
    } else {
        res.status(401).json({ message: "You are not authorized to delete this employee" });
    }
  }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export default checkAdmin;
