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

app.use(httpLogger('dev'));

const corsOptions = {
  origin: 'http://localhost:8080',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type',
  credentials: true
};
app.use(cors(corsOptions)); //see more at https://www.npmjs.com/package/cors
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