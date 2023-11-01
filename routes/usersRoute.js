const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const appError = require("../utils/appError");

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${extension}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(appError.create("file must be an image", 400), false);
  }
};

const upload = multer({ storage: diskStorage, fileFilter: fileFilter });

router.route("/").get(verifyToken, usersController.getAllUsers);
router
  .route("/register")
  .post(upload.single("avatar"), usersController.register);
router.route("/login").post(usersController.login);

module.exports = router;
