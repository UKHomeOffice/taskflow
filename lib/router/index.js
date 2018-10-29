const { Router } = require('express');
const CaseRouter = require('./case');
const Case = require('../models/case');
const { isEmpty } = require('lodash');

module.exports = ({ hooks }) => {

  const router = Router();

  router.use((req, res, next) => {
    res.respondWith = data => {
      res.json({ data });
    };
    next();
  });

  router.get('/', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        if (isEmpty(req.query)) {
          return Case.list();
        }

        return Case.filterByParams(req.query);
      })
      .then(data => {
        res.respondWith(data);
      })
      .catch(next);
  });

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

  router.use(CaseRouter({ hooks }));

  return router;

};
