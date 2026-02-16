module.exports = (session, sessionStore) => {
  return session({
    name: "survey-session",
    secret: process.env.SESSION_SECRET,
    resave: true, // Force session to be saved back to the session store
    rolling: true, // Force the session identifier cookie to be set on every response
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      path: "/",
      maxAge: null, // Session will not expire based on time
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production", // only use secure in production
    },
  });
};
