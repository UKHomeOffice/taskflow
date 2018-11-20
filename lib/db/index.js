const Knex = require('knex');
const { knexSnakeCaseMappers } = require('objection');

const migrate = require('./migrate');

module.exports = {
  connect: (connection = {}) => {
    return Knex({
      client: 'postgres',
      connection,
      ...knexSnakeCaseMappers()
    });
  },
  migrate
};
