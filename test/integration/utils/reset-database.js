const settings = require('../../../knexfile').test;
const Case = require('../../../lib/db/case');
const ActivityLog = require('../../../lib/db/activity-log');
const Database = require('../../../lib/db');

module.exports = () => {
  return Promise.resolve()
    .then(() => {
      const db = Database.connect(settings.connection);
      return Promise.resolve()
        .then(() => ActivityLog.query(db).delete())
        .then(() => Case.query(db).delete());
    });
};
