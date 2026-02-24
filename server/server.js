// External Module Imports
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2");
const MySQLStore = require("express-mysql-session")(session);

const { ipaddress } = require("./models");
const rateLimit = require("express-rate-limit");

// Configuration and Initialization
require("dotenv").config();

const { dboptions, dbSessionSchema } = require("./config/config.js");
let sessionStore;
if (process.env.NODE_ENV !== "test") {
  const pool = mysql.createPool(dboptions);
  sessionStore = new MySQLStore({ schema: dbSessionSchema }, pool);
}

const app = express();
const helmet = require("helmet");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static("./survey/public"));

app.use(require("./config/sessionConfig")(session, sessionStore));

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per windowMs
  message: "Too many feedback submissions, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Create an in-memory cache for IP tracking
const ipCache = new Map();
const IP_FLUSH_INTERVAL = 60000; // Flush every 60 seconds
const MAX_CACHE_SIZE = 1000; // Maximum IPs to cache

// Batch update function
const flushIpCache = async () => {
  if (ipCache.size === 0) return;

  const batch = Array.from(ipCache.entries());
  ipCache.clear();

  for (const [ip, data] of batch) {
    try {
      let ipRecord = await ipaddress.findOne({
        where: { ipAddress: ip },
      });

      if (ipRecord) {
        await ipRecord.update({
          lastSeen: data.lastSeen,
          visitCount: ipRecord.visitCount + data.visits,
          userAgent: data.userAgent,
          lastSessionId: data.lastSessionId,
        });
      } else {
        await ipaddress.create({
          ipAddress: ip,
          sessionId: data.lastSessionId,
          userAgent: data.userAgent,
          firstSeen: data.firstSeen,
          lastSeen: data.lastSeen,
          visitCount: data.visits,
          metadata: data.metadata,
        });
      }
    } catch (error) {
      console.error(`Error flushing IP ${ip}:`, error);
    }
  }
};

// Schedule periodic flushes
let flushInterval;
if (process.env.NODE_ENV !== "test") {
  flushInterval = setInterval(flushIpCache, IP_FLUSH_INTERVAL);
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  await flushIpCache();
  process.exit(0);
});

// Optimized middleware
app.use(async (req, res, next) => {
  // Skip non-essential paths
  const skipPaths = ["/favicon.ico", "/robots.txt", "/health", "/static"];
  if (skipPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  // Skip if already processed in this session
  if (req.session.ipProcessed) {
    return next();
  }

  try {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : req.socket.remoteAddress;

    // Update cache instead of database
    if (ipCache.has(ip)) {
      const cached = ipCache.get(ip);
      cached.visits += 1;
      cached.lastSeen = new Date();
      cached.lastSessionId = req.sessionID;
    } else {
      // Check cache size
      if (ipCache.size >= MAX_CACHE_SIZE) {
        await flushIpCache(); // Force flush if cache is full
      }

      ipCache.set(ip, {
        visits: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        lastSessionId: req.sessionID,
        userAgent: req.headers["user-agent"] || "",
        metadata: {
          headers: {
            "x-forwarded-for": req.headers["x-forwarded-for"],
            "x-real-ip": req.headers["x-real-ip"],
            "cf-connecting-ip": req.headers["cf-connecting-ip"],
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    req.session.ipProcessed = true;
    req.session.ip = ip;
  } catch (error) {
    console.error("Error caching IP:", error);
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
  {
    path: "/api/feedbacks",
    router: require("./routes/feedbacks"),
    limiter: feedbackLimiter,
  },
  { path: "/api/userstatements", router: require("./routes/userstatements") },
  { path: "/api/experiments", router: require("./routes/experiment") },
];

routers.forEach(({ path, router, limiter }) => {
  if (limiter) {
    app.use(path, limiter, router);
  } else {
    app.use(path, router);
  }
});

// Static Files and Catch-all Routes
app.get("/api/images/*", (req, res) => {
  const imageName = req.params[0];
  res.sendFile(`${__dirname}/survey/public/${imageName}`);
});

app.get("/api", (req, res) => {
  // Touching the session ensures the cookie is sent even if it's a new session
  req.session.initialized = true;
  res.send(req.sessionID);
});

// Database Sync and Server Initialization
const db = require("./models");

if (require.main === module) {
  db.sequelize.sync().then(() => {
    app.listen(4000, () => {
      console.log("Server running on port 4000");
      console.log("Github Commit Hash: ", process.env.GITHUB_HASH);
    });
  });
}

module.exports = app;
