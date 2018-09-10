const Case = require('../../../lib/db/case');

module.exports = () => {
  return Promise.resolve()
    .then(() => {
      return Case.query().delete();
    });
};
