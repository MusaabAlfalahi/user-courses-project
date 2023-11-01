const User = require("../models/user");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const bcrypt = require("bcrypt");
const generateJWT = require("../utils/generateJWT");

const getAllUsers = async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  const users = await User.find({}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);

  res.json({ status: httpStatusText.SUCCESS, data: { users } });
};

const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser) {
    const error = appError.create(
      "user already registered",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const hashed = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashed,
    role,
    avatar: req.file.filename
  });

  const token = await generateJWT({ email: newUser.email, id: newUser._id, role: newUser.role });
  newUser.token = token;

  await newUser.save();

  return res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    const error = appError.create(
      "email and password are required",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const user = await User.findOne({ email });

  if (!user) {
    const error = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(error);
  }

  const matched = await bcrypt.compare(password, user.password);

  if (user && matched) {
    const token = await generateJWT({ email: user.email, id: user._id, role: user.role });

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { token },
    });
  } else {
    const error = appError.create("logged in failed", 500, httpStatusText.FAIL);
    return next(error);
  }
});

module.exports = {
  getAllUsers,
  register,
  login,
};
