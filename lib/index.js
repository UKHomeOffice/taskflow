const { Router } = require('express');
const { json } = require('body-parser');
const { Model } = require('objection');
const Database = require('./db');
const router = require('./router');
const Hooks = require('./hooks');
const Decorators = require('./decorators');
const activityLogger = require('./activitylog/hooks/logger');

const Case = require('./models/case');

module.exports = (settings = {}) => {
  const db = Database.connect(settings.db);
  Case.db(db);
  Model.knex(db);

  const flow = Router();
  const hooks = Hooks.init();
  const decorators = Decorators.init();

  flow.use(json({ extended: true }));

  flow.use(router({ hooks, decorators }));

  flow.hook = (event, fn) => hooks.create(event, fn);
  flow.migrate = () => Database.migrate(settings.db);

  flow.decorate = fn => decorators.add(fn);

  flow.hook('create', activityLogger());
  flow.hook('update', activityLogger());
  flow.hook('status:*:*', activityLogger());

  flow.db = db;

  return flow;
};
