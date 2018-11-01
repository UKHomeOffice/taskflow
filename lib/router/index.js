const { Router } = require('express');
const CaseRouter = require('./case');
const Case = require('../models/case');
const { isEmpty, flattenDeep } = require('lodash');

module.exports = ({ hooks, middleware }) => {

  const router = Router();

  router.use((req, res, next) => {
    res.respondWith = data => {
      res.json({ data });
    };
    next();
  });

  const fetchCases = (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        if (isEmpty(req.query)) {
          return Case.list();
        }

        return Case.filterByParams(req.query);
      })
      .then(cases => {
        req.cases = cases;
      })
      .then(() => next())
      .catch(next);
  };

  const returnCases = (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        res.respondWith(req.cases);
      })
      .catch(next);
  };

  router.get('/', flattenDeep([middleware.before, fetchCases, middleware.after, returnCases]));

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
