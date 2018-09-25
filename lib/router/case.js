const { Router } = require('express');

const Case = require('../models/case');

module.exports = ({ hooks }) => {

  const router = Router();

  router.param('case', (req, res, next, id) => {
    Case.find(id)
      .then(model => {
        req.case = model;
        next();
      })
      .catch(next);
  });

  router.get('/:case', (req, res, next) => {
    res.respondWith(req.case);
  });

  router.put('/:case', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.case.update(req.body, { hooks, user: req.user });
      })
      .then(() => {
        return Case.find(req.case.id);
      })
      .then(result => {
        res.respondWith(result);
      })
      .catch(next);
  });

  router.put('/:case/status', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.case.status(req.body.status, { hooks, user: req.user });
      })
      .then(() => {
        return Case.find(req.case.id);
      })
      .then(result => {
        res.respondWith(result);
      })
      .catch(next);
  });

  return router;

};
