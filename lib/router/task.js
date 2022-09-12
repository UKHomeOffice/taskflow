const { Router } = require('express');
const { merge } = require('lodash');
const Task = require('../models/task');

module.exports = () => {

  const router = Router();
  router.get('/', (req, res, next) => {
    return res.respondWith(req.task);
  });

  router.put('/', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return Task.query().findById(req.task.id);
      })
      .then(result => {
        // merge the data in the payload into the data field of the task
        const data = merge({}, result.data, req.body.data);
        return req.task.update(data, { user: req.user, payload: req.body, preserveUpdatedAt: req.query.preserveUpdatedAt });
      })
      .then(() => {
        return Task.find(req.task.id, req.transaction);
      })
      .then(result => {
        return res.respondWith(result);
      })
      .catch(next);
  });

  router.put('/status', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.task.status(req.body.status, { user: req.user, payload: req.body });
      })
      .then(() => {
        return Task.find(req.task.id, req.transaction);
      })
      .then(result => {
        return res.respondWith(result);
      })
      .catch(next);
  });

  router.put('/assign', (req, res, next) => {
    return Promise.resolve()
      .then(() => Task.query(req.transaction).findById(req.task.id))
      .then(task => {
        if (task.assignedTo === req.body.profileId) {
          return; // assigning to same user is a no-op
        }
        return req.task.assign(req.body.profileId, { user: req.user, payload: req.body });
      })
      .then(() => Task.find(req.task.id, req.transaction))
      .then(result => res.respondWith(result))
      .catch(next);
  });

  router.post('/comment(s)?', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.task.comment(req.body.comment, { user: req.user, payload: req.body });
      })
      .then(() => {
        return Task.find(req.task.id, req.transaction);
      })
      .then(result => {
        return res.respondWith(result);
      })
      .catch(next);
  });

  router.put('/comment/:id', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.task.updateComment(req.params.id, req.body.comment, { user: req.user, payload: req.body });
      })
      .then(() => Task.find(req.task.id, req.transaction))
      .then(result => res.respondWith(result))
      .catch(next);
  });

  router.delete('/comment/:id', (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        return req.task.deleteComment(req.params.id, { user: req.user });
      })
      .then(() => Task.find(req.task.id, req.transaction))
      .then(result => res.respondWith(result))
      .catch(next);
  });

  return router;

};
