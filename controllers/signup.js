const handleSignup = (logger, knex, bcrypt) => (req, res) => {
  const { fullname, username, password } = req.body;

  if (!fullname || !username || ! password) {
    return res.status(400).json('Incorrect form submission');
  }

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
          res.json(user)
        })
    })
    .then(trx.commit)
    .catch(err => {
      logger.error(`/signup - ${err}`)
      trx.rollback();
    })
  })
  .catch(err => {
    logger.error(`/signup - ${err}`)
    res.status(400).json('Unable to register')
  });
};

module.exports = {
  handleSignup
};