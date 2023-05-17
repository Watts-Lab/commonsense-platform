const express = require('express');
const app = express();
const cors = require('cors');

// app.use(cors());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json())

const db = require("./models");

const session = require('express-session')

const mysql = require('mysql2');
const MySQLStore = require('express-mysql-session')(session);

const options = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'mysqlroot',
    database: 'CommonsenseDB',
    connectionLimit: 10,
    createDatabaseTable: true
};

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
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
        sameSite: true,
        secure: false 
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
