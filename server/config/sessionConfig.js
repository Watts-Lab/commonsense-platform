module.exports = (session, sessionStore) => {
  return session({
    name: "survey-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    ...(sessionStore ? { store: sessionStore } : {}), // only set store if it exists
    cookie: {
      path: "/",
      maxAge: null,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    },
  });
};
