const { Router } = require('express');

const { NotFoundError } = require('../errors');
const Case = require('../db/case');

module.exports = ({ hooks }) => {

  const router = Router();

  router.param('case', (req, res, next, id) => {
    Case.query().findById(id)
      .then(model => {
        req.case = model;
        return model ? next() : next(new NotFoundError());
      })
      .catch(next);
  });

  router.get('/:case', (req, res, next) => {
    res.respondWith(req.case);
  });

  return router;

};
