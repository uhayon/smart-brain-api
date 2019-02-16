const handleProfileGet = (logger, knex) => (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json('Invalid request');
  }

  knex
  .select('*')
  .from('users')
  .where({id})
  .then(([user, _]) => {
    user ? res.json(user) : res.status(404).json('User not found');
  })
  .catch(err => {
    logger.error(`/profile - ${err}`);
    res.status(400).json('Unable to get profile');
  })
};

module.exports = {
  handleProfileGet
}