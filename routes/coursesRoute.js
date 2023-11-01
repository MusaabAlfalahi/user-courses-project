const express = require("express");
const router = express.Router();
const Controller = require("../controllers/courses");
const validationSchema = require("../middleware/validationSchema");
const verifyToken = require("../middleware/verifyToken");
const userRoles = require("../utils/userRoles");
const allowedTo = require("../middleware/allowedTo");

router
  .route("/")
  .get(Controller.getAllCourses)
  .post(
    verifyToken,
    validationSchema(),
    allowedTo(userRoles.Manager),
    Controller.addCourse
  );

router
  .route("/:id")
  .get(Controller.getCourse)
  .patch(Controller.updateCourse)
  .delete(
    verifyToken,
    allowedTo(userRoles.Admin, userRoles.Manager),
    Controller.deleteCourse
  );

module.exports = router;
