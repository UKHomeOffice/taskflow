const uuid = require('uuid/v4');
const Model = require('../db/case');

const { NotFoundError, InvalidRequestError } = require('../errors');

class Case {

  constructor(model = {}) {
    this.id = model.id;
    this._status = model.status;
    this._data = model.data;
  }

  toJSON() {
    return {
      id: this.id,
      status: this._status,
      data: this._data
    };
  }

  status(status, { hooks, user }) {
    const previous = this._status;
    if (!status) {
      throw new InvalidRequestError({ status: 'required' });
    }
    if (!status.match(/^[a-z-]+$/)) {
      throw new InvalidRequestError({ status: 'invalid' });
    }

    return hooks.invoke({
      event: `status:${previous}:${status}`,
      id: this.id,
      meta: {
        previous,
        user
      },
      handler: () => Model.query().patchAndFetchById(this.id, { status })
    });
  }

  update(data, { hooks, user }) {
    return hooks.invoke({
      event: 'update',
      id: this.id,
      meta: {
        data,
        user
      },
      handler: () => Model.query().patchAndFetchById(this.id, { data })
    });
  }

  static list() {
    return Model.query().select();
  }

  static create(data, { hooks, user }) {
    const model = {
      id: uuid(),
      status: 'new',
      data
    };
    return hooks.invoke({
      event: 'create',
      id: model.id,
      meta: { user, data },
      handler: () => Model.query().insert(model)
    });
  }

  static find(id) {
    return Model.query().findById(id)
      .then(model => {
        if (!model) {
          throw new NotFoundError();
        }
        return new Case(model);
      });
  }

}

module.exports = Case;
