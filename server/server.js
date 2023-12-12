const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// app.use(cors());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

const db = require("./models");

// session management and store
const session = require("express-session");

const mysql = require("mysql2");
const MySQLStore = require("express-mysql-session")(session);
const options = require(__dirname + "/config/config.js").dboptions;
const pool = mysql.createPool(options);
const sessionStore = new MySQLStore(options, pool);

app.use(
  session({
    name: "survey-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      path: "/",
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
      sameSite: true,
      secure: false, // remove in production
    },
  })
);

// routers
const statementRouter = require("./routes/statements");
const answerRouter = require("./routes/answers");
const resultRouter = require("./routes/results");
const userRouter = require("./routes/users");
const treatmentRouter = require("./routes/treatments");
const feedbackRouter = require("./routes/feedbacks");
const userStatements = require("./routes/userstatements");

app.use("/api/statements", statementRouter);
app.use("/api/answers", answerRouter);
app.use("/api/results", resultRouter);
app.use("/api/users", userRouter);
app.use("/api/treatments", treatmentRouter);
app.use("/api/feedbacks", feedbackRouter);
app.use("/api/userstatements", userStatements);

// serve static files
app.use(express.static("./survey/public"));
app.get("/api/images/*", (req, res) => {
  // Use req.params[0] to capture the wildcard part of the URL
  const imageName = req.params[0];
  console.log("imageName", imageName);
  res.sendFile(`${__dirname}/survey/public/${imageName}`);
});

const { getAllTreatments } = require("./controllers/treatments");

getAllTreatments();

// Access the session as req.session
app.get("/api", function (req, res) {
  res.send(req.sessionID);
});

db.sequelize.sync().then(() => {
  app.listen(4000, () => {
    console.log("server on port 4000");
    console.log("Github Commit Hash: ", process.env.GITHUB_HASH);
  });
});
