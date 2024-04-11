// External Module Imports
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mysql = require("mysql2");
const MySQLStore = require("express-mysql-session")(session);

// Configuration and Initialization
require("dotenv").config();
const { dboptions } = require("./config/config.js");
const pool = mysql.createPool(dboptions);
const sessionStore = new MySQLStore(dboptions, pool);
const app = express();

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.static("./survey/public"));
app.use(require("./config/sessionConfig")(session, sessionStore));

// Routers
const routers = [
  { path: "/api/statements", router: require("./routes/statements") },
  { path: "/api/answers", router: require("./routes/answers") },
  { path: "/api/results", router: require("./routes/results") },
  { path: "/api/users", router: require("./routes/users") },
  { path: "/api/treatments", router: require("./routes/treatments") },
  { path: "/api/feedbacks", router: require("./routes/feedbacks") },
  { path: "/api/userstatements", router: require("./routes/userstatements") },
  { path: "/api/experiments", router: require("./routes/experiment") },
];

routers.forEach(({ path, router }) => app.use(path, router));

// Static Files and Catch-all Routes
app.get("/api/images/*", (req, res) => {
  const imageName = req.params[0];
  res.sendFile(`${__dirname}/survey/public/${imageName}`);
});


const { getAllTreatments } = require("./controllers/treatments");
getAllTreatments();


app.get("/api", (req, res) => {
  res.send(req.sessionID);
});

// Database Sync and Server Initialization
const db = require("./models");
db.sequelize.sync().then(() => {
  app.listen(4000, () => {
    console.log("Server running on port 4000");
    console.log("Github Commit Hash: ", process.env.GITHUB_HASH);
  });
});

module.exports = app;
