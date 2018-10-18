const Knex = require('knex');

const migrate = require('./migrate');

module.exports = {
  connect: (connection = {}) => {
    return Knex({
      client: 'postgres',
      connection
    });
  },
  migrate
};
