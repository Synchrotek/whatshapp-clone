const express = require('express');
const { isAuthenticated } = require('../middlewares/auth.js');
const { attchmentsMulter } = require('../middlewares/multer.js');
const {
    newGroupChat, getMyChats, addMembers, removeMember, leaveGroup,
    sendAttachments, getMessages,
    getChatDetails, renameGroup, deleteGroup,
} = require('../controllers/chat.controllers.js');
const {
    validateHandler,
    newGroupChatValidator, addMembersValidator, removeMemberValidator,
    sendAttachmentsValidator,
    renameGroupValidator
} = require('../lib/validator.js');

const router = express.Router();

router.use(isAuthenticated);
router.post('/new',
    newGroupChatValidator(),
    validateHandler,
    newGroupChat
);
router.get('/my-chats', getMyChats);
router.put("/add-members",
    addMembersValidator(),
    validateHandler,
    addMembers
);
router.put("/remove-member",
    removeMemberValidator(),
    validateHandler,
    removeMember
);
router.delete("/leave/:chatId", leaveGroup);

// send attachments -------------------
router.post('/message/files',
    attchmentsMulter,
    sendAttachmentsValidator(),
    validateHandler,
    sendAttachments
);

// get messages -----------------------
router.get("/message/:chatId", getMessages)

// get chat details, rename, delete ---
router.route("/edit/:chatId")
    .get(getChatDetails)
    .put(renameGroupValidator(), validateHandler, renameGroup)
    .delete(deleteGroup);

module.exports = router;