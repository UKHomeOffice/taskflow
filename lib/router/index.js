const { Router } = require('express');
const uuid = require('uuid/v4');

const CaseRouter = require('./case');
const Case = require('../db/case');

module.exports = ({ hooks }) => {

  const router = Router();

  router.use((req, res, next) => {
    res.respondWith = data => {
      res.json({ data });
    };
    next();
  });

  router.get('/', (req, res, next) => {
    Case.query().select()
      .then(data => {
        res.respondWith(data);
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
        return hooks.invoke({
          event: 'create',
          id: model.id,
          meta: {},
          handler: () => Case.query().insert(model)
        });
      })
      .then(data => {
        res.respondWith(data);
      })
      .catch(next);
  });

  router.use(CaseRouter({ hooks }));

  return router;

};
