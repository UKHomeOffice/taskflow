const { Router } = require('express');
const Case = require('../models/case');

module.exports = () => {
  const router = Router();

  const fetchCases = (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return Case.filterByParams(req.query);
      })
      .then(cases => {
        req.cases = cases.results;
        req.meta = { count: cases.total };
        next();
      })
      .catch(next);
  };

  const returnCases = (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        res.respondWith(
          req.cases,
          req.meta
        );
      })
      .catch(next);
  };

  router.use(fetchCases);
  router.use(returnCases);

  return router;
};
