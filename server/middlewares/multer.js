const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './constants/files')
    },
    filename: function (req, file, cb) {
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniquePrefix + '-' + file.originalname);
    }
})

const multerUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    }
});

const attchmentsMulter = multerUpload.array("files", 5);
module.exports = { multerUpload, attchmentsMulter };