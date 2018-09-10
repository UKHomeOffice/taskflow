class NotFound extends Error {

  constructor(msg = 'Not found') {
    super(msg);
  }

  get status() {
    return 404;
  }

}

module.exports = NotFound;
