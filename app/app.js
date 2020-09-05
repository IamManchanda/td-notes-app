const express = require("express");
const compression = require("compression");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const appRoutes = require("./routes/app-routes");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(appRoutes);

app.use((req, res, next) => {
  res.render("index");
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    status: err.status,
  });
});

module.exports = app;
