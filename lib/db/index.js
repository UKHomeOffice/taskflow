const { Model } = require('objection');
const Knex = require('knex');

const config = require('../../knexfile');

module.exports = {
  connect: () => {
    const settings = config[process.env.NODE_ENV || 'development'];
    const db = Knex(settings);
    Model.knex(db);
  }
};
