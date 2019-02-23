const searchProfile = (id, res, logger, knex) => {
  knex
  .select('age', 'favouritedetectiontype', 'rating')
  .from('users')
  .where({id})
  .then(([profile, _]) => {
    profile ? res.json(profile) : res.status(404).json('User not found');
  })
  .catch(err => {
    logger.error(`/profile - ${err}`);
    res.status(400).json('Unable to get profile');
  });
}

const handleProfileGet = (logger, knex) => (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json('Invalid request');
  }

  searchProfile(id, res, logger, knex);
};

const handleProfileUpdate = (logger, knex) => (req, res) => {
  const { id } = req.params;
  const { favouritedetectiontype, age, rating } = req.body;

  knex('users')
    .where({ id })
    .update({ favouritedetectiontype, age, rating })
    .then(response => {
      if (response) {
        return searchProfile(id, res, logger, knex);
      } else {
        res.status(400).json('Unable to update');
      }
    })
    .catch(err => {
      logger.error('/profile/:id - ProfileUpdate', err);
    })
}

module.exports = {
  handleProfileGet,
  handleProfileUpdate
}