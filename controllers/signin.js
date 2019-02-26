const { getAuthTokenId, createSession } = require('../middleware/authorization');

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