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
        TASKFLOW_POSTGRES_HOST: connection.host || process.env.TASKFLOW_POSTGRES_HOST,
        TASKFLOW_POSTGRES_PORT: connection.port || process.env.TASKFLOW_POSTGRES_PORT,
        TASKFLOW_POSTGRES_USER: connection.user || process.env.TASKFLOW_POSTGRES_USER,
        TASKFLOW_POSTGRES_PASSWORD: connection.password || process.env.TASKFLOW_POSTGRES_PASSWORD,
        TASKFLOW_POSTGRES_DATABASE: connection.database || process.env.TASKFLOW_POSTGRES_DATABASE
      }),
      stdio: (options.log === false) ? 'ignore' : 'inherit'
    });
    migrator.on('error', e => reject(e));
    migrator.on('exit', code => resolve());
  });

};
