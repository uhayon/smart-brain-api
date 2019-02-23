require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require ('cors');
const helmet = require('helmet');
const logger = require('./utils/winston');
const morgan = require('morgan');
const knex = require('knex')({
  client: 'pg',
  connection: process.env.POSTGRES_URI
});

const { handleSignup } = require('./controllers/signup');
const { handleSignin } = require('./controllers/signin');
const { handleProfileGet, handleProfileUpdate } = require('./controllers/profile');
const { handleImageRecognition, handleApiCall } = require('./controllers/image');

const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"]
  }
}));
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
app.post('/profile/:id', handleProfileUpdate(logger, knex))
app.put('/image', handleImageRecognition(logger, knex));
app.post('/imageurl', handleApiCall(logger));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
});