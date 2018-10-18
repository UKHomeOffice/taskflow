const settings = require('../../../knexfile').test;
const Case = require('../../../lib/db/case');
const Database = require('../../../lib/db');

module.exports = () => {
  return Promise.resolve()
    .then(() => {
      const db = Database.connect(settings.connection);
      return Case.query(db).delete();
    });
};
