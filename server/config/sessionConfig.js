module.exports = (session, sessionStore) => {
  return session({
    name: "survey-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      path: "/",
      maxAge: 1000 * 60 * 60 * 1, // 1 hour
      httpOnly: true,
      sameSite: 'None',
      secure: true, // remove in production
    },
  });
};
