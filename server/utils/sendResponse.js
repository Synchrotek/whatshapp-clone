const sendResponse = (res, statusCode, success, message) => {
    return res.status(statusCode).json({
        success,
        message
    });
}

module.exports = sendResponse;