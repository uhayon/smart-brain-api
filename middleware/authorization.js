const jwt = require('jsonwebtoken');

const requireAuth = (redisClient) => (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json('Unauthorized');
  }

  const [_, token] = authorization.split(' ');
  return redisClient.get(token, (err, reply) => {
    if (err || !reply) {
      return res.status(401).json('Unauthorized');
    }
    return next();
  });
}

const signToken = username => {
  const jwtPayload = { username };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1 days'});
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

module.exports = {
  requireAuth,
  signToken,
  getAuthTokenId,
  setToken,
  createSession
}