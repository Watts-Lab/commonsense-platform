// External Module Imports
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const mysql = require("mysql2");
const MySQLStore = require("express-mysql-session")(session);
const { ipaddress } = require("./models");

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

// IP Recording Middleware
app.use(async (req, res, next) => {
  try {
    // Only record IP once per session
    if (!req.session.ipRecorded) {
      const forwardedFor = req.headers["x-forwarded-for"];
      const ip = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : req.socket.remoteAddress;

      const userAgent = req.headers["user-agent"] || "";

      console.log("Recording IP Address: ", ip, "Session:", req.sessionID);

      // First, try to find existing record
      let ipRecord = await ipaddress.findOne({
        where: {
          sessionId: req.sessionID,
          ipAddress: ip,
        },
      });

      if (ipRecord) {
        // Update existing record
        await ipRecord.update({
          lastSeen: new Date(),
          visitCount: ipRecord.visitCount + 1,
          userAgent: userAgent,
          metadata: {
            headers: {
              "x-forwarded-for": req.headers["x-forwarded-for"],
              "x-real-ip": req.headers["x-real-ip"],
              "cf-connecting-ip": req.headers["cf-connecting-ip"],
            },
            timestamp: new Date().toISOString(),
          },
        });
        console.log("Updated IP record, visit count:", ipRecord.visitCount + 1);
      } else {
        // Create new record
        ipRecord = await ipaddress.create({
          sessionId: req.sessionID,
          ipAddress: ip,
          userAgent: userAgent,
          firstSeen: new Date(),
          lastSeen: new Date(),
          visitCount: 1,
          metadata: {
            headers: {
              "x-forwarded-for": req.headers["x-forwarded-for"],
              "x-real-ip": req.headers["x-real-ip"],
              "cf-connecting-ip": req.headers["cf-connecting-ip"],
            },
            timestamp: new Date().toISOString(),
          },
        });
        console.log("Created new IP record with visit count: 1");
      }

      req.session.ipRecorded = true;
      req.session.ip = ip;
    }
  } catch (error) {
    // Don't block the request if IP recording fails
    console.error("Error recording IP address:", error);
  }

  next();
});

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
