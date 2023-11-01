const express = require("express");
const coursesRoute = require("./routes/coursesRoute");
const usersRoute = require("./routes/usersRoute");
const mongoose = require("mongoose");
const cors = require("cors");
const httpStatusText = require("./utils/httpStatusText");
const path = require("path");
require("dotenv").config();
const app = express();

mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log("mongodb server started");
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/courses", coursesRoute);
app.use("/api/users", usersRoute);

// global middleware for not found routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: httpStatusText.ERROR,
    message: "This resource is not available",
  });
});

// global error handler
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    status: err.statusText || httpStatusText.ERROR,
    message: err.message,
    code: err.statusCode || 500,
    data: null,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
