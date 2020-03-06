const { Router } = require('express');
const Task = require('../models/task');

module.exports = () => {
  const router = Router();

  const fetchTasks = (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return Task.filterByParams(req.query);
      })
      .then(tasks => {
        req.tasks = tasks.results;
        req.meta = { count: tasks.total };
        next();
      })
      .catch(next);
  };

  const returnTasks = (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return res.respondWith(
          req.tasks,
          req.meta
        );
      })
      .catch(next);
  };

  router.use(fetchTasks);
  router.use(returnTasks);

  return router;
};
