import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mysql from 'mysql2';
import path from 'path';
import dotenv from 'dotenv';
import { db, ipaddress } from './db/models';
import { dboptions, dbSessionSchema } from './config/config';
import { buildSessionConfig } from './config/sessions.config';
import statementsRouter from './routes/statements';
import experimentRouter from './routes/experiment';
import answersRouter from './routes/answers';
import usersRouter from './routes/users';
import resultsRouter from './routes/results';
import feedbacksRouter from './routes/feedbacks';
import treatmentsRouter from './routes/treatments';
import userStatementsRouter from './routes/userstatements';

dotenv.config({ quiet: true });

const MySQLStore = require('express-mysql-session')(session);

let sessionStore: session.Store | undefined;
if (process.env.NODE_ENV !== 'test') {
  const pool = mysql.createPool({
    ...dboptions,
    port: dboptions.port ? Number(dboptions.port) : undefined,
  });
  sessionStore = new MySQLStore({ schema: dbSessionSchema }, pool);
}

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../survey/public')));

app.use(session(buildSessionConfig(sessionStore)));

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many feedback submissions, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const ipCache = new Map<
  string,
  {
    visits: number;
    firstSeen: Date;
    lastSeen: Date;
    lastSessionId: string;
    userAgent: string;
    metadata: Record<string, unknown>;
  }
>();

const IP_FLUSH_INTERVAL = 60000;
const MAX_CACHE_SIZE = 1000;

const flushIpCache = async () => {
  if (ipCache.size === 0) {
    return;
  }

  const batch = Array.from(ipCache.entries());
  ipCache.clear();

  for (const [ip, data] of batch) {
    try {
      const ipRecord = await ipaddress.findOne({ where: { ipAddress: ip } });
      if (ipRecord) {
        await ipRecord.update({
          lastSeen: data.lastSeen,
          visitCount: (ipRecord.get('visitCount') as number) + data.visits,
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
    } catch {}
  }
};

if (process.env.NODE_ENV !== 'test') {
  setInterval(flushIpCache, IP_FLUSH_INTERVAL);
}

process.on('SIGTERM', async () => {
  await flushIpCache();
  process.exit(0);
});

app.use(async (req, _res, next) => {
  const skipPaths = ['/favicon.ico', '/robots.txt', '/health', '/static'];
  if (skipPaths.some((routePath) => req.path.startsWith(routePath))) {
    return next();
  }

  if (req.session.ipProcessed) {
    return next();
  }

  try {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.split(',')[0]?.trim()) || req.socket.remoteAddress;

    if (ip) {
      if (ipCache.has(ip)) {
        const cached = ipCache.get(ip);
        if (cached) {
          cached.visits += 1;
          cached.lastSeen = new Date();
          cached.lastSessionId = req.sessionID;
        }
      } else {
        if (ipCache.size >= MAX_CACHE_SIZE) {
          await flushIpCache();
        }

        ipCache.set(ip, {
          visits: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          lastSessionId: req.sessionID,
          userAgent: req.headers['user-agent'] || '',
          metadata: {
            headers: {
              'x-forwarded-for': req.headers['x-forwarded-for'],
              'x-real-ip': req.headers['x-real-ip'],
              'cf-connecting-ip': req.headers['cf-connecting-ip'],
            },
            timestamp: new Date().toISOString(),
          },
        });
      }

      req.session.ipProcessed = true;
      req.session.ip = ip;
    }
  } catch {}

  next();
});

app.use('/api/statements', statementsRouter);
app.use('/api/experiments', experimentRouter);
app.use('/api/answers', answersRouter);
app.use('/api/users', usersRouter);
app.use('/api/results', resultsRouter);
app.use('/api/treatments', treatmentsRouter);
app.use('/api/userstatements', userStatementsRouter);
app.use('/api/feedbacks', feedbackLimiter, feedbacksRouter);

app.get('/api/images/*imageName', (req, res) => {
  const imageNameParam = (req.params as Record<string, string | string[]>)
    .imageName;
  const imageName = Array.isArray(imageNameParam)
    ? imageNameParam.join('/')
    : imageNameParam;

  res.sendFile(path.resolve(__dirname, `../survey/public/${imageName}`));
});

app.get('/api', (req, res) => {
  req.session.initialized = true;
  res.send(req.sessionID);
});

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  (async () => {
    if (process.env.DB_SYNC === 'true') {
      // Keep sync opt-in so migrations remain the source of truth.
      await db.sequelize.sync();
      console.warn('DB_SYNC=true: schema synchronized via Sequelize sync().');
    } else {
      await db.sequelize.authenticate();
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Github Commit Hash: ', process.env.GITHUB_HASH);
    });
  })().catch((error) => {
    console.error('Failed to initialize database connection:', error);
    process.exit(1);
  });
}

export default app;
