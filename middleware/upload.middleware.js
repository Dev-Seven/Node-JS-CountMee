const path = require('path')
const multer = require('multer')
require('dotenv').config()

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.AVATAR_PATH)
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

var storageCsv = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.AVATAR_PATH_CSV)
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

var storagePdf = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.AVATAR_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

exports.upload = multer ({
    storage : storage,
    fileFilter: function (req, file, callback) {
        if (
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/png" ||
            file.mimetype == "video/mp4" ||
            file.mimetype == "video/mkv" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/gif" ||
            file.mimetype == "image/tiff" ||
            file.mimetype == "image/psd" ||
            file.mimetype == "image/svg" ||
            file.mimetype == "image/heif" ||
            file.mimetype == "image/heic" ||
            file.mimetype == "video/webm" ||
            file.mimetype == "video/m4v" ||
            file.mimetype == "video/m4p" ||
            file.mimetype == "video/avi" ||
            file.mimetype == "video/wmv" ||
            file.mimetype == "video/mpg" ||
            file.mimetype == "video/mp2" ||
            file.mimetype == "video/mpeg" ||
            // file.mimetype === 'text/csv' ? callback(null, true) : callback(null, false) ||
            // file.mimetype === 'file/csv' ||
            file.mimetype === 'text/csv' ||
            file.json == "file/json" ||
            file.mimetype === "application/pdf"
        ) {
            callback(null,true)
        } else {
            console.log("Only image/jpeg and image/png and video/mp4 and file/csv and file/json and application/pdf files are supported!")
            // callback(null, false) //cmnt for mimetype
            callback(null, true)
        }
    },
    // limits : {
    //     fileSize : 1024 * 1024 * 2
    // }
})

exports.uploadCsv = multer ({
    storage : storageCsv,
    fileFilter: function (req, file, callback) {
        if (
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/png" ||
            file.mimetype == "video/mp4" ||
            // file.mimetype === 'text/csv' ? callback(null, true) : callback(null, false) ||
            // file.mimetype === 'file/csv' ||
            file.mimetype === 'text/csv' ||
            file.json == "file/json" ||
            file.mimetype === "application/pdf"
        ) {
            callback(null,true)
        } else {
            console.log("Only image/jpeg and image/png and video/mp4 and file/csv and file/json and application/pdf files are supported!")
            callback(null, false)
        }
    },
    // limits : {
    //     fileSize : 1024 * 1024 * 2
    // }
})

exports.uploadPdf = multer ({
    storage : storagePdf,
    fileFilter: function (req, file, callback) {
        if (
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/png" ||
            file.mimetype == "video/mp4" ||
            // file.mimetype === 'text/csv' ? callback(null, true) : callback(null, false) ||
            // file.mimetype === 'file/csv' ||
            file.mimetype === 'text/csv' ||
            file.json == "file/json" ||
            file.mimetype === "application/pdf"
        ) {
            callback(null,true)
        } else {
            console.log("Only image/jpeg and image/png and video/mp4 and file/csv and file/json and application/pdf files are supported!")
            callback(null, false)
        }
    },
    // limits : {
    //     fileSize : 1024 * 1024 * 2
    // }
})

// module.exports = {
//     upload,uploadCsv
// }