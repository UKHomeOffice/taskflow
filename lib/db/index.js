const { Model } = require('objection');
const Knex = require('knex');

module.exports = {
  connect: (connection = {}) => {
    const db = Knex({
      client: 'postgres',
      connection
    });
    Model.knex(db);
  }
};
