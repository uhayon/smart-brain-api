const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require ('cors');
const logger = require('./winston');
const morgan = require('morgan');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'uhayon',
    password: '',
    database: 'smart-brain'
  }
});

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
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  knex
  .select('username', 'hash')
  .from('login')
  .where('username', '=', username)
  .then(([loginUser, _]) => {
    if (loginUser) {
      const userValid = bcrypt.compareSync(password, loginUser.hash);

      if (userValid) {
        knex('users')
        .select('*')
        .where({username})
        .returning('*')
        .then(([user, _]) => {
          logger.info(`Login successfull`);
          res.json(user);
        })
        .catch(err => {
          logger.error(`/signin - ${err}`)
          res.status(404).json('Unable to get the user')
        })
      } else {
        logger.error(`/signin - Wrong credentials`);
        res.status(400).json('Wrong credentials');
      }
    } else {
      res.status(400).json('Wrong credentials');
    }
  });
})

app.post('/signup', (req, res) => {
  const { fullname, username, password } = req.body;

  const hash = bcrypt.hashSync(password);
  knex.transaction(trx => {
    trx.insert({
      hash,
      username
    })
    .into('login')
    .returning('username')
    .then(([loginUsername, _]) => {
      return trx('users')
        .insert({
          fullname: fullname,
          username: loginUsername,
          joined: new Date()
        })
        .returning('*')
        .then(([user, _]) => {
          logger.info(`/signup - User created: ${loginUsername}`)
          res.json(user)
        })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => {
    logger.error(`/signup - ${err}`)
    res.status(400).json('Unable to register')
  });
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  knex
  .select('*')
  .from('users')
  .where({id})
  .then(([user, _]) => {
    user ? res.json(user) : res.status(404).json('User not found');
  })
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  knex('users')
  .where({id})
  .increment('entries', 1)
  .returning('*')
  .then(([user, _]) => {
    user ? res.json(user) : res.status(404).json('User not found');
  })
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
});