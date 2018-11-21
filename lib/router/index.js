const { Router } = require('express');
const caseRouter = require('./case');
const Case = require('../models/case');
const casesRouter = require('./cases');

module.exports = ({ hooks, decorators }) => {
  const router = Router();

  router.param('caseId', (req, res, next, caseId) => {
    Case.find(caseId)
      .then(model => {
        // we don't want the full Case model when fetching, just the values
        req.case = req.method === 'GET' ? model.toJSON() : model;
        next();
      })
      .catch(next);
  });

  router.use((req, res, next) => {
    res.respondWith = (data, meta) => {
      decorators.apply(data)
        .then(decorated => {
          res.json({ data: decorated, meta });
        })
        .catch(next);
    };
    next();
  });

  router.get('/', casesRouter());

  router.use('/:caseId', caseRouter({ hooks }));

  router.post('/', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return Case.create(req.body, { hooks, user: req.user });
      })
      .then(result => {
        return Case.find(result.id);
      })
      .then(data => {
        res.respondWith(data);
      })
      .catch(next);
  });

  return router;
};
