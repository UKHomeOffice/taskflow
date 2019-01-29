const { Router } = require('express');
const { json } = require('body-parser');
const Database = require('./db');
const router = require('./router');
const Hooks = require('./hooks');
const Decorators = require('./decorators');
const activityLogger = require('./activitylog/hooks/logger');
const Case = require('./models/case');

module.exports = (settings = {}) => {
  const db = Database.connect(settings.db);
  Case.db(db);

  const flow = Router();
  const hooks = Hooks.init();
  const decorators = Decorators.init();

  const responder = (req, res) => (data, meta) => {
    return decorators.apply(data, req.user)
      .then(decorated => {
        res.json({ data: decorated, meta });
      });
  };

  flow.responder = responder;

  flow.use(json({ extended: true }));

  flow.use(router({ hooks, responder }));

  flow.hook = (event, fn) => hooks.create(event, fn);
  flow.migrate = () => Database.migrate(settings.db);

  flow.decorate = fn => decorators.add(fn);

  flow.hook('create', activityLogger(db));
  flow.hook('update', activityLogger(db));
  flow.hook('status:*:*', activityLogger(db));

  flow.db = db;

  return flow;
};
