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
const redis = require('redis');

const { handleSignup } = require('./controllers/signup');
const { handleAuthentication } = require('./controllers/signin');
const { handleProfileGet, handleProfileUpdate } = require('./controllers/profile');
const { handleImageRecognition, handleApiCall } = require('./controllers/image');
const { requireAuth } = require('./middleware/authorization'); 

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


let redisClient;
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV !== 'production') {
  console.log('dev')
  app.use(cors());
  redisClient = redis.createClient(process.env.REDIS_URI);
} else {
  console.log('prd')
  app.use(cors({
    origin: (origin, callback) => {
      if (origin === process.env.FRONT_END_DOMAIN) {
        callback(null, true);
      } else {
        callback('Not allowed by CORS')
      }
    }
  }));
  redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_URI, {password: process.env.REDIS_PASSWORD});
}
app.post('/signin', handleAuthentication(logger, knex, bcrypt, redisClient));
app.post('/signup', handleSignup(logger, knex, bcrypt, redisClient));
app.get('/profile/:id', requireAuth(redisClient), handleProfileGet(logger, knex));
app.post('/profile/:id', requireAuth(redisClient), handleProfileUpdate(logger, knex))
app.put('/image', requireAuth(redisClient), handleImageRecognition(logger, knex));
app.post('/imageurl', requireAuth(redisClient), handleApiCall(logger));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
});