const { Router } = require('express');

const Database = require('./db');
const Case = require('./db/case');

module.exports = () => {

  const router = Router();
  Database.connect();

  router.get('/', (req, res, next) => {
    Case.query().select()
      .then(data => {
        res.json({ data });
      })
      .catch(next);
  });
  router.post('/', (req, res, next) => {
    const model = {
      id: '123',
      status: 'new',
      data: req.body
    };
    Case.query().insert(model)
      .then(data => {
        res.json({ data });
      })
      .catch(next);
  });

  return router;

};
