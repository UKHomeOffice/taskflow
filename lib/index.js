const { Router } = require('express');
const { json } = require('body-parser');

const Database = require('./db');
const router = require('./router');
const Hooks = require('./hooks');

module.exports = settings => {

  Database.connect(settings);

  const flow = Router();
  const hooks = Hooks.init();

  flow.use(json({ extended: true }));

  flow.use(router({ hooks }));

  flow.hook = (event, fn) => hooks.create(event, fn);
  flow.migrate = () => Database.migrate(settings);

  return flow;

};
