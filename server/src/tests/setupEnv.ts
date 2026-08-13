// Jest setup: guarantee the environment variables the app reads at module load
// have sane defaults during tests, so the suite is self-contained and does not
// depend on a local .env file or CI-provided secrets.
//
// Auth controllers read JWT_SECRET at import time and sign/verify tokens with
// it; without a value, jsonwebtoken produces unverifiable tokens and the auth
// tests fail. SESSION_SECRET is likewise read when building the session config.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || 'test-session-secret';
