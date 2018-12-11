const { Router } = require('express');
const Case = require('../models/case');

module.exports = ({ hooks }) => {

  const router = Router();

  router.get('/', (req, res, next) => {
    return res.respondWith(req.case);
  });

  router.put('/', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.case.update(req.body, { hooks, user: req.user, payload: req.body });
      })
      .then(() => {
        return Case.find(req.case.id);
      })
      .then(result => {
        return res.respondWith(result);
      })
      .catch(next);
  });

  router.put('/status', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.case.status(req.body.status, { hooks, user: req.user, payload: req.body.meta });
      })
      .then(() => {
        return Case.find(req.case.id);
      })
      .then(result => {
        return res.respondWith(result);
      })
      .catch(next);
  });

  return router;

};
