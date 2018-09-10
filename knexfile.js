module.exports = {

  test: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './test.sqlite3'
    }
  },

  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './dev.sqlite3'
    }
  }

};
