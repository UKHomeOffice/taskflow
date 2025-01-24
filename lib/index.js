const { v4: uuid } = require('uuid');
const { Router } = require('express');
const { json } = require('body-parser');
const { transaction } = require('objection');
const Database = require('./db');
const router = require('./router');
const Hooks = require('./hooks');
const Decorators = require('./decorators');
const activityLogger = require('./activitylog/hooks/logger');
const Task = require('./models/task');

const init = (settings = {}) => {
  const db = Database.connect(settings.db);
  Task.db(db);

  const flow = Router();
  const hooks = Hooks.init();
  Task.setHooks(hooks);

  const decorators = Decorators.init();

  const responder = (req, res) => (data, meta) => {
    return decorators.apply(data, req.user)
      .then(decorated => {
        res.json({ data: decorated, meta });
      });
  };

  flow.responder = responder;

  flow.use((req, res, next) => {
    const send = responder(req, res);
    res.respondWith = (data, meta) => {
      req.transaction.commit()
        .then(() => {
          return send(data, meta);
        })
        .catch(e => {
          res.status(500).json({ message: e.message, stack: e.stack });
        });
    };
    next();
  });

  flow.use(json({ extended: true }));

  flow.use((req, res, next) => {
    transaction.start(db)
      .then(trx => {
        trx._id = uuid();
        req.transaction = trx;
      })
      .then(() => next())
      .catch(next);
  });

  flow.use(router());

  flow.use((err, req, res, next) => {
    if (req.transaction) {
      return req.transaction.rollback()
        .then(() => next(err), next);
    }
    next(err);
  });

  flow.hook = (event, fn) => hooks.create(event, fn);
  flow.migrate = () => Database.migrate(settings.db);

  flow.decorate = (fn, params) => decorators.add(fn, params);

  flow.hook('create', activityLogger(db));
  flow.hook('update', activityLogger(db));
  flow.hook('assign', activityLogger(db));
  flow.hook('status:*:*', activityLogger(db));
  flow.hook('comment', activityLogger(db));
  flow.hook('update-comment', activityLogger(db));
  flow.hook('delete-comment', activityLogger(db));

  flow.db = db;
  flow.Task = Task;

  return flow;
};

init.Task = Task;

module.exports = init;
