const searchProfile = (id, res, logger, knex) => {
  return knex
  .select('*')
  .from('users')
  .where({id})
  .then(([profile, _]) => {
    return profile ? profile : Promise.reject('User not found');
  })
  .catch(err => Promise.reject(err));
}

const handleProfileGet = (logger, knex) => (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json('Invalid request');
  }

  searchProfile(id, res, logger, knex)
    .then(profile => res.json(profile))
    .catch(err => {
      logger.error('/profile - GET', err);
      res.status(400).json('Unable to get profile')
    })
};

const handleProfileUpdate = (logger, knex) => (req, res) => {
  const { id } = req.params;
  const { favouritedetectiontype, age, rating } = req.body;

  knex('users')
    .where({ id })
    .update({ favouritedetectiontype, age, rating })
    .then(response => {
      if (response) {
        return searchProfile(id, res, logger, knex)
        .then(profile => res.json(profile))
        .catch(err => {
          logger.error('/profile - UPDATE', err);
          res.status(400).json('Unable to get profile')
        })
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