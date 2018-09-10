const { Router } = require('express');
const { json } = require('body-parser');

const Database = require('./db');
const router = require('./router');
const hooks = require('./hooks');

module.exports = settings => {

  Database.connect(settings);

  const flow = Router();

  flow.use(json({ extended: true }));

  flow.use(router({ hooks }));

  flow.hook = (event, fn) => hooks.create(event, fn);

  return flow;

};
