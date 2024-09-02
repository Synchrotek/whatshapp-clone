const jwt = require('jsonwebtoken');

const sendToken = (res, user, statusCode, message) => {
    const token = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET
    );

    res.cookie("app_token", token, {
        maxAge: 10 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    });

    return res.status(statusCode).json({
        success: true,
        message
    });
}

module.exports = { sendToken };