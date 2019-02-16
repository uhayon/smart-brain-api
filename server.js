require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require ('cors');
const logger = require('./winston');
const morgan = require('morgan');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.BD_NAME
  }
});

const { handleSignup } = require('./controllers/signup');
const { handleSignin } = require('./controllers/signin');
const { handleProfileGet } = require('./controllers/profile');
const { handleImageRecognition, handleApiCall } = require('./controllers/image');

const app = express();
app.use(bodyParser.json());
app.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'));
app.use(cors());
// app.use(cors({
//   origin: (origin, callback) => {
//     if (origin === 'http://localhost:3001') {
//       callback(null, true);
//     } else {
//       callback('Not allowed by CORS')
//     }
//   }
// }))

app.post('/signin', handleSignin(logger, knex, bcrypt));
app.post('/signup', handleSignup(logger, knex, bcrypt));
app.get('/profile/:id', handleProfileGet(logger, knex));
app.put('/image', handleImageRecognition(knex, logger));
app.post('/imageurl', handleApiCall(logger));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
});