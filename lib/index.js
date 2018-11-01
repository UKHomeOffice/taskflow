const { Router } = require('express');
const { json } = require('body-parser');

const Database = require('./db');
const router = require('./router');
const Hooks = require('./hooks');

const Case = require('./models/case');

module.exports = ({ db, middleware } = {}) => {

  const models = Database.connect(db);

  Case.db(models);

  const flow = Router();
  const hooks = Hooks.init();

  flow.use(json({ extended: true }));

  flow.use(router({ hooks, middleware }));

  flow.hook = (event, fn) => hooks.create(event, fn);
  flow.migrate = () => Database.migrate(db);

  flow.db = db;

  return flow;

};
