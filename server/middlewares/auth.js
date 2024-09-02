const jwt = require('jsonwebtoken');
const { TryCatch } = require("./error");

const isAuthenticated = (req, res, next) => {
    const token = req.cookies["app_token"];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Please login before accessing this route."
        });
    }

    const decodedData = jwt.verify(
        token, process.env.JWT_SECRET
    )
    req.userId = decodedData._id;
    next();
};

module.exports = { isAuthenticated };