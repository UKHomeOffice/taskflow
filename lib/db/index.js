const { Model } = require('objection');
const Knex = require('knex');

const migrate = require('./migrate');

module.exports = {
  connect: (connection = {}) => {
    const db = Knex({
      client: 'postgres',
      connection
    });
    Model.knex(db);
  },
  migrate
};
