const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

module.exports = () => {
  return Promise.resolve()
    .then(() => {
      return promisify(exec)(`rm -f ${path.resolve(__dirname, '../../../test.sqlite3')}`);
    })
    .then(() => {
      return promisify(exec)('npm run migrate -- --env test');
    });
};
