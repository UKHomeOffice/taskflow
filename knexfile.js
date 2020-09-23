const { knexSnakeCaseMappers } = require('objection');

const snakeCaseMapper = process.env.SNAKE_MAPPER ? knexSnakeCaseMappers() : {};

module.exports = {

  development: {
    client: 'postgres',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USERNAME || 'postgres',
      database: process.env.DATABASE_NAME || 'taskflow',
      password: process.env.DATABASE_PASSWORD || 'test-password',
      port: process.env.DATABASE_PORT
    }
  },

  test: {
    ...snakeCaseMapper,
    client: 'postgres',
    connection: {
      host: process.env.TASKFLOW_POSTGRES_HOST || 'localhost',
      user: process.env.TASKFLOW_POSTGRES_USER || 'postgres',
      password: process.env.TASKFLOW_POSTGRES_PASSWORD || 'test-password',
      database: process.env.TASKFLOW_POSTGRES_DATABASE || 'taskflow-test',
      port: process.env.TASKFLOW_POSTGRES_PORT || 5432
    }
  }

};
