const Clarifai = require('clarifai');

const ImageParser = require('../utils/ImageParser');

Clarifai.CELEBRITY_MODEL = 'e466caa0619f444ab97497640cefc4dc';
const app = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
});

const handleApiCall = (logger) => (req, res) => {
  const { detectionType, imageUrl } = req.body;
  app.models
    .predict(Clarifai[detectionType], imageUrl)
    .then(data => {
      console.log('entrò acà', data);
      const imageParser = new ImageParser(detectionType, data);
      res.json(imageParser.parseImageData());
    })
    .catch(err => {
      console.log('entrò acà tambièn');
      logger.error(`/imageurl - ${JSON.stringify(err)}`);
      res.status(400).json('Unable to work with API');
    });
}

const handleImageRecognition = (logger, knex) => (req, res) => {
  const { id } = req.body;
  knex('users')
  .where({id})
  .increment('entries', 1)
  .returning('*')
  .then(([user, _]) => {
    user ? res.json(user) : res.status(404).json('User not found');
  })
  .catch(err => {
    logger.error(`/image - ${JSON.stringify(err)}`);
    res.status(400).json('Unable to process image');
  })
};

module.exports = {
  handleImageRecognition,
  handleApiCall
}