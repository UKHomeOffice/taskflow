// Update with your config settings.

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
    connection: {
      filename: './dev.sqlite3'
    }
  }

};
