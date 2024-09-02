const express = require('express');
const { multerUpload } = require('../middlewares/multer.js');
const {
    login, register,
    getMyProfile, logout,
    searchUser, sendFriendRequest,
    acceptFriendRequest,
    getAllNotifications,
    getMyFriends
} = require('../controllers/user.controllers.js');
const {
    validateHandler,
    registerValidator, loginValidator,
    sendFriendRequestValidator,
    acceptRequestValidator
} = require('../lib/validator.js');
const { isAuthenticated } = require('../middlewares/auth.js');

const router = express.Router();

// public routes --------------------
router.post('/register',
    registerValidator(),
    validateHandler,
    register
);
router.post('/login',
    loginValidator(),
    validateHandler,
    login
);

// protected routes ------------------
router.use(isAuthenticated);
router.get('/me', getMyProfile);
router.get('/logout', logout);

router.get('/search', searchUser);
router.put("/send-frequest",
    sendFriendRequestValidator(),
    validateHandler,
    sendFriendRequest
);
router.put("/accept-frequest",
    acceptRequestValidator(),
    validateHandler,
    acceptFriendRequest
);

router.get("/notifications", getAllNotifications);
router.get("/my-friends", getMyFriends);

module.exports = router;