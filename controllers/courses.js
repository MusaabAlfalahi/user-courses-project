const { validationResult } = require("express-validator");
const Course = require("../models/course");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");

const getAllCourses = async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { courses } });
};

const getCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    const error = appError.create("Course not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  return res.json({ status: httpStatusText.SUCCESS, data: { course } });
});

const addCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(error);
  }
  const course = new Course(req.body);
  await course.save();
  res.status(201).json({ status: httpStatusText.SUCCESS, data: { course } });
});

const updateCourse = asyncWrapper(async (req, res) => {
  const course = await Course.updateOne(
    { _id: req.params.id },
    {
      $set: { ...req.body },
    }
  );

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { course } });
});

const deleteCourse = asyncWrapper(async (req, res) => {
  await Course.deleteOne({ _id: req.params.id });

  return res.json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  getAllCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};
