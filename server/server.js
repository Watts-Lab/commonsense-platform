const express = require('express');
const app = express();
const cors = require('cors');

// app.use(cors());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json())

const db = require("./models");

// session management and store
const session = require('express-session')

const mysql = require('mysql2');
const MySQLStore = require('express-mysql-session')(session);
const options = require(__dirname + '/config/config.json')['options'];
const pool = mysql.createPool(options);
const sessionStore = new MySQLStore(options, pool);

// routers
const statementRouter = require('./routes/statements');
const answerRouter = require('./routes/answers');
app.use("/statements", statementRouter);
app.use("/answers", answerRouter);

app.use(session({
    name: 'user-session',
    secret: 'keyboardcat',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { 
        path: '/',
        maxAge: 1000 * 60 * 60 * 12, // 2 hours
        sameSite: true,
        secure: false // remove in production
    }

}));
  
// Access the session as req.session
app.get('/', function(req, res) {
    console.log(req.sessionID)
    res.send(req.sessionID);
})

  

db.sequelize.sync().then(() => {
    app.listen(8000, () => {
        console.log("server on port 8000")
    });
});
