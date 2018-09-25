const { Router } = require('express');

const CaseRouter = require('./case');
const Case = require('../models/case');

module.exports = ({ hooks }) => {

  const router = Router();

  router.use((req, res, next) => {
    res.respondWith = data => {
      res.json({ data });
    };
    next();
  });

  router.get('/', (req, res, next) => {
    Case.list()
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
