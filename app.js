require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var favicon = require("serve-favicon");
var engine = require("ejs-locals");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var compression = require("compression");
var helmet = require("helmet");

var app = express();
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// Set up mongoose connection
var mongoose = require("mongoose");
var mongoDB = "mongodb+srv://0000:8888@cluster0.ezviz.mongodb.net/pcshopping?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.set("view options", { layout: "layout.ejs" });

// view engine setup
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fontawesome/fontawesome-free/'));
app.use('/lineawesome', express.static(__dirname + '/node_modules/line-awesome/dist/line-awesome'));

app.use(compression());
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", {title: "Oops..."});
});

module.exports = app;
