const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const authenticateUser = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized !" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(400).json({message : "Something went wrong!", error});
  }
};

module.exports =  authenticateUser ;