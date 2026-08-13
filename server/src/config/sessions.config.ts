import session from 'express-session';

export function buildSessionConfig(
  store?: session.Store,
): session.SessionOptions {
  return {
    name: 'survey-session',
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: true,
    ...(store ? { store } : {}),
    cookie: {
      path: '/',
      maxAge: undefined,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  };
}
