const { Router } = require('express');

const { NotFoundError, InvalidRequestError } = require('../errors');
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

  router.put('/:case/status', (req, res, next) => {
    const previous = req.case.status;
    const status = req.body.status;

    if (!status) {
      return next(new InvalidRequestError({ status: 'required' }));
    }
    if (!status.match(/^[a-z-]+$/)) {
      return next(new InvalidRequestError({ status: 'invalid' }));
    }

    return Promise.resolve()
      .then(() => {
        return hooks.invoke({
          event: `status:${previous}:${status}`,
          id: req.case.id,
          handler: () => Case.query().patchAndFetchById(req.case.id, { status })
        });
      })
      .then(data => {
        res.respondWith(data);
      })
      .catch(next);
  });

  return router;

};
