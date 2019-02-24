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

module.exports = {
  requireAuth
}