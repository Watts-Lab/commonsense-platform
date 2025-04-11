module.exports = (session, sessionStore) => {
  return session({
    name: "survey-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      path: "/",
      maxAge: null, // Session will not expire based on time
      httpOnly: true,
      sameSite: 'None',
      secure: true, // remove in production
    },
  });
};
