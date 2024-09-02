exports.TryCatch = (passedFunction) => async (req, res, next) => {
    try {
        await passedFunction(req, res, next);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message,
        });
    }
};

exports.ErrorResponse = async (res, statusCode, message, err) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: err
    });
}