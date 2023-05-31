const express = require("express");
const app = express();
const cors = require("cors");

// app.use(cors());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

const db = require("./models");

// session management and store
const session = require("express-session");

const mysql = require("mysql2");
const MySQLStore = require("express-mysql-session")(session);
const options = require(__dirname + "/config/config.json")["options"];
const pool = mysql.createPool(options);
const sessionStore = new MySQLStore(options, pool);

// routers
const statementRouter = require("./routes/statements");
const answerRouter = require("./routes/answers");
const resultRouter = require("./routes/results");
const userRouter = require("./routes/users");

app.use("/api/statements", statementRouter);
app.use("/api/answers", answerRouter);
app.use("/api/results", resultRouter);
app.use("/api/users", userRouter);

app.use(
  session({
    name: "user-session",
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      path: "/",
      maxAge: 1000 * 60 * 60 * 12, // 12 hours
      sameSite: true,
      secure: false, // remove in production
    },
  })
);

// Access the session as req.session
app.get("/api", function (req, res) {
  // console.log(req.sessionID)
  res.send(req.sessionID);
});

db.sequelize.sync().then(() => {
  app.listen(4000, () => {
    console.log("server on port 4000");
  });
});
