//server app
const express = require('express');
const app = express();
const httpLogger = require('morgan');
const cors = require('cors');
const port = 3000;
const logSlowRequests= require('./middleware/logSlowRequests');
const userRouter = require('./userManagement/userRouter');
const {db, getPacientOne} = require('./db_config/dbInit');
const {loginUser} = require('./userManagement/userService');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


app.use(httpLogger('dev'));

const corsOptions = {
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ handle preflight properly

app.use(express.urlencoded({ extended: false }))
app.use(express.json()) //we expect JSON data to be sent as payloads
app.use(logSlowRequests(100));
app.use(userRouter);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/get-pacient-one', async (req, res) => {
  const pacientOneData = await getPacientOne(db); 
  if (pacientOneData) {
    res.json(pacientOneData);
  } else {
    res.status(404).json({ message: 'No pacient found' });
  }
});

app.post('/login-client', async (req, res) =>{
    loginUser(req, res);
});

app.post('/data', (req, res) => {
  let { user } = req.body
  console.log('trying to post the following data: ', user)
  res.send('Succes')
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});