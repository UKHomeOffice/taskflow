class InvalidRequestError extends Error {

  constructor() {
    super('Invalid request');
  }

  get status() {
    return 400;
  }

}

module.exports = InvalidRequestError;
