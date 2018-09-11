module.exports = {

  test: {
    client: 'postgres',
    connection: {
      host: process.env.TASKFLOW_POSTGRES_HOST || 'localhost',
      user: process.env.TASKFLOW_POSTGRES_USER || 'taskflow-test',
      database: process.env.TASKFLOW_POSTGRES_DB || 'taskflow-test'
    }
  }

};
