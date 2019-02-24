const jwt = require('jsonwebtoken');

const handleSignin = (logger, knex, bcrypt, req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return Promise.reject('Incorrect form submission');
  }

  return knex
  .select('username', 'hash')
  .from('login')
  .where('username', '=', username)
  .then(([loginUser, _]) => {
    if (loginUser) {
      const userValid = bcrypt.compareSync(password, loginUser.hash);

      if (userValid) {
        return knex('users')
        .select('*')
        .where({username})
        .returning('*')
        .then(([user, _]) => user)
        .catch(err => {
          logger.error(`/signin - ${err}`)
          Promise.reject('Unable to get the user')
        })
      } else {
        Promise.reject('Wrong credentials');
      }
    } else {
      Promise.reject('Wrong credentials');
    }
  });
}

const getAuthTokenId = (authorization, redisClient) => {
  const [_, token] = authorization.split(' ');
  return new Promise((resolve, reject) => {
    return redisClient.get(token, (err, reply) => {
      if (err || !reply) {
        return reject('Unauthorized');
      }

      return resolve({id: reply})
    })
  });
}

const signToken = username => {
  const jwtPayload = { username };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1 days'});
}

const setToken = (key, value, redisClient) => {
  return new Promise((resolve, reject) => {
    return redisClient.scan(value, (errScan, replyScan) => {
      if (errScan || !replyScan) {
        return reject('Error Scan');
      }

      if (replyScan.length) {
        const [_, tokens] = replyScan;
        return redisClient.del(tokens, (errDel, replyDel) => {
          return resolve(redisClient.set(key, value));
        })
      }
      return resolve(redisClient.set(key, value));
    })
  })
  // return Promise.resolve(redisClient.set(key, value));
}

const createSession = (user, logger, redisClient) => {
  const { id, username } = user;
  const token = signToken(username);
  return setToken(token, id, redisClient)
    .then(() => ({ success: 'true', userId: id, token }))
    .catch(err => {
      logger.error('Create Session - ', err);
    })
}

const handleAuthentication = (logger, knex, bcrypt, redisClient) => (req, res) => {
  const { authorization } = req.headers;
  return authorization ? 
    getAuthTokenId(authorization, redisClient)
      .then(auth => res.json(auth))
      .catch(err => res.status(400).json(err)) : 
    handleSignin(logger, knex, bcrypt, req, res)
      .then(user => {
        return user.id && user.username ? createSession(user, logger, redisClient) : Promise.reject('Authentication failed');
      })
      .then(session => res.json(session))
      .catch(err => {
        logger.error('/signin - Auth', err)
        res.status(400).json('Authentication failed')
      });
}

module.exports = {
  handleAuthentication
}