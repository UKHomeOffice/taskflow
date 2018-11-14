const { Router } = require('express');
const caseRouter = require('./case');
const Case = require('../models/case');
const casesRouter = require('./cases');

const caseDecorator = Router();

module.exports = ({ hooks }) => {
  const router = Router();

  router.param('caseId', (req, res, next, caseId) => {
    Case.find(caseId)
      .then(model => {
        req.case = model.toJSON();
        next();
      })
      .catch(next);
  });

  router.use((req, res, next) => {
    res.respondWith = (data, meta) => {
      res.json({ data, meta });
    };
    next();
  });

  router.get('/', casesRouter({ caseDecorator }));

  router.use('/:caseId', caseRouter({ caseDecorator, hooks }));

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

  router.decorator = caseDecorator;

  return router;
};
