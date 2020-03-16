const { Router } = require('express');
const taskRouter = require('./task');
const Task = require('../models/task');
const tasksRouter = require('./tasks');

module.exports = () => {
  const router = Router();

  router.param('taskId', (req, res, next, taskId) => {
    Task.find(taskId, req.transaction)
      .then(model => {
        // we don't want the full Task model when fetching, just the values
        req.task = req.method === 'GET' ? model.toJSON() : model;
        next();
      })
      .catch(next);
  });

  router.get('/', tasksRouter());

  router.use('/:taskId', taskRouter());

  router.post('/', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return Task.create(req.body, { user: req.user, payload: req.body, transaction: req.transaction });
      })
      .then(result => {
        return Task.find(result.id, req.transaction);
      })
      .then(data => {
        return res.respondWith(data);
      })
      .catch(next);
  });

  return router;
};
