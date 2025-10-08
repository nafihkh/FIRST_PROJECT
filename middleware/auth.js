const jwt = require("jsonwebtoken");
const User = require("../models/User");

function auth(roleArray = []) {
  return async (req, res, next) => {
    const token =
      req.header("Authorization")?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Access denied: No token" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("username email role profile_photo phone location jobtittle mail_verified phone_verified");

      if (roleArray.length && !roleArray.includes(user.role)) {
        return res
          .status(403)
          .json({ error: "Forbidden: insufficient role" });
      }

      req.user = user;      
      res.locals.user = user; 

      next();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}

module.exports = auth;