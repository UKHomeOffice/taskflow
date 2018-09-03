const { Router } = require('express');

module.exports = () => {

  const router = Router();

  router.get('/', (req, res, next) => {
    res.json({});
  });
  router.post('/', (req, res, next) => {
    res.json({});
  });

  return router;

};
