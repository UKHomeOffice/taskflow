const settings = require('../../../knexfile').test;
const Task = require('../../../lib/db/task');
const ActivityLog = require('../../../lib/db/activity-log');
const Database = require('../../../lib/db');

module.exports = () => {
  return Promise.resolve()
    .then(() => {
      const db = Database.connect(settings.connection);
      return Promise.resolve()
        .then(() => ActivityLog.query(db).delete())
        .then(() => Task.query(db).delete());
    });
};
