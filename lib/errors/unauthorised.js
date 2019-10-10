class UnauthorisedError extends Error {
  constructor(message = 'Unauthorised') {
    super(message);
  }

  get status() {
    return 403;
  }
}

module.exports = UnauthorisedError;
