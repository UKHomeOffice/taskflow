const { Router } = require('express');
const { json } = require('body-parser');

const router = require('./router');

module.exports = () => {

  const flow = Router();

  flow.use(json({ extended: true }));

  flow.use(router());

  flow.hook = (event, fn) => {};

  return flow;

};
