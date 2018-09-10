const { Router } = require('express');
const uuid = require('uuid/v4');

const Case = require('../db/case');

module.exports = ({ hooks }) => {

  const router = Router();

  router.get('/', (req, res, next) => {
    Case.query().select()
      .then(data => {
        res.json({ data });
      })
      .catch(next);
  });

  router.post('/', (req, res, next) => {
    const model = {
      id: uuid(),
      status: 'new',
      data: req.body
    };
    return Promise.resolve()
      .then(() => {
        return hooks.invoke('create', model);
      })
      .then(() => {
        return Case.query().insert(model);
      })
      .then(data => {
        res.json({ data });
      })
      .catch(next);
  });

  return router;

};
