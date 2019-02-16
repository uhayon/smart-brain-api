const handleSignin = (logger, knex, bcrypt) => (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json('Incorrect form submission');
  }

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
          res.json(user);
        })
        .catch(err => {
          logger.error(`/signin - ${err}`)
          res.status(404).json('Unable to get the user')
        })
      } else {
        res.status(400).json('Wrong credentials');
      }
    } else {
      res.status(400).json('Wrong credentials');
    }
  });
}

module.exports = {
  handleSignin
}