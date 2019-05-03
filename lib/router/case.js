const { Router } = require('express');
const { merge } = require('lodash');
const Case = require('../models/case');

module.exports = ({ hooks }) => {

  const router = Router();
  router.get('/', (req, res, next) => {
    return res.respondWith(req.case);
  });

  router.put('/', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return Case.query().findById(req.case.id);
      })
      .then(result => {
        // merge the data in the payload into the data field of the case
        const data = merge({}, result.data, req.body.data);
        return req.case.update(data, { hooks, user: req.user, payload: req.body });
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
        return req.case.status(req.body.status, { hooks, user: req.user, payload: req.body });
      })
      .then(() => {
        return Case.find(req.case.id);
      })
      .then(result => {
        return res.respondWith(result);
      })
      .catch(next);
  });

  router.post('/comment(s)?', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.case.comment(req.body.comment, { hooks, user: req.user, payload: req.body });
      })
      .then(() => {
        return Case.find(req.case.id);
      })
      .then(result => {
        return res.respondWith(result);
      })
      .catch(next);
  });

  router.delete('/comment/:id', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.case.deleteComment(req.params.id, { hooks, user: req.user });
      })
      .then(() => Case.find(req.case.id))
      .then(result => res.respondWith(result))
      .catch(next);
  });

  return router;

};
