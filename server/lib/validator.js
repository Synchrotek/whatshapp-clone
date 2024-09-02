const { body, check, validationResult } = require('express-validator');
const { ErrorResponse } = require('../middlewares/error');

/* validaton schemas =============================================== */
/* User Routes validation ---------------------------------- */
exports.registerValidator = () => [
    // name, email, password, bio
    body("name", "Please enter Name").notEmpty(),
    body("email")
        .notEmpty().withMessage("Please enter a email")
        .isEmail().withMessage("Please enter a valid email"),
    body("password", "Please enter a password").notEmpty(),
    body("bio", "Please enter a bio").notEmpty(),
    // check('avatar', "Please upload avatar").notEmpty(),
];

exports.loginValidator = () => [
    body("email")
        .notEmpty().withMessage("Please enter a email")
        .isEmail().withMessage("Please enter a valid email"),
    body("password", "Please enter a password").notEmpty(),
];

exports.sendFriendRequestValidator = () => [
    body("userId", "Please enter a valid userId").notEmpty(),
];

exports.acceptRequestValidator = () => [
    body("f_requestId", "Please enter a f_requestId (Friend request Id)").notEmpty(),
    body("accept")
        .notEmpty().withMessage("Please add accept: true or false")
        .isBoolean().withMessage("accept must be boolean"),
];

/* Chat Routes validation ---------------------------------- */
exports.newGroupChatValidator = () => [
    body("name", "Please enter name").notEmpty(),
    body("members")
        .notEmpty().withMessage("Please enter Members array")
        .isArray({ min: 2, max: 100 })
        .withMessage("Members list should be in 2-100"),
];

exports.addMembersValidator = () => [
    body("chatId", "Please enter chatId").notEmpty(),
    body("members")
        .notEmpty().withMessage("Please enter Members array")
        .isArray({ min: 1, max: 96 })
        .withMessage("Members list should be in 1-96"),
];

exports.removeMemberValidator = () => [
    body("chatId", "Please enter chatId").notEmpty(),
    body("memberId", "Please enter memberId to remove").notEmpty()
];

exports.sendAttachmentsValidator = () => [
    body("chatId", "Please enter chatId").notEmpty(),
    check('files')
        .notEmpty().withMessage("Please upload one or more attachments")
        .isArray({ min: 1, max: 5 })
        .withMessage("No of attachments must be 1-5")
];

exports.renameGroupValidator = () => [
    body("newName", "Please enter a new name for group").notEmpty()
];

/* validaton checker ================================================ */
exports.validateHandler = (req, res, next) => {
    const errors = validationResult(req);

    const errMessages = errors.array().map(err => err.msg);

    if (errors.isEmpty()) return next();
    ErrorResponse(res, 400, errMessages);
}



