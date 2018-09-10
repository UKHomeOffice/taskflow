module.exports = {

  test: {
    client: 'postgres',
    connection: {
      host: process.env.POSTGRES_HOST || 'localhost',
      user: process.env.POSTGRES_USER || 'taskflow-test',
      database: process.env.POSTGRES_DB || 'taskflow-test'
    }
  }

};
