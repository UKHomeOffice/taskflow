const { Model } = require('objection');
const settings = require('../../../knexfile').test;
const Case = require('../../../lib/db/case');
const ActivityLog = require('../../../lib/models/activity-log');
const Database = require('../../../lib/db');

module.exports = () => {
  return Promise.resolve()
    .then(() => {
      const db = Database.connect(settings.connection);
      Model.knex(db);
      return Promise.resolve()
        .then(() => ActivityLog.query().delete())
        .then(() => Case.query(db).delete());
    });
};
