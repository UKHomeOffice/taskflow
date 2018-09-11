const path = require('path');
const { spawn } = require('child_process');
const witch = require('witch');

const knex = witch('knex');

module.exports = (connection = {}, options = {}) => {

  return new Promise((resolve, reject) => {
    const cwd = path.resolve(__dirname, '../..');
    const args = ['migrate:latest', '--cwd', cwd, '--env', 'test'];
    const migrator = spawn(knex, args, {
      env: Object.assign({}, process.env, {
        TASKFLOW_POSTGRES_HOST: connection.host,
        TASKFLOW_POSTGRES_PORT: connection.port,
        TASKFLOW_POSTGRES_USER: connection.user,
        TASKFLOW_POSTGRES_PASSWORD: connection.password,
        TASKFLOW_POSTGRES_DATABASE: connection.database
      }),
      stdio: (options.log === false) ? 'ignore' : 'inherit'
    });
    migrator.on('error', e => reject(e));
    migrator.on('exit', code => resolve());
  });

};
