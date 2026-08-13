import 'express-session';

declare module 'express-session' {
  interface SessionData {
    ipProcessed?: boolean;
    ip?: string;
    initialized?: boolean;
  }
}
