const uuid = require('uuid/v4');
const Model = require('../db/case');
const { NotFoundError, InvalidRequestError } = require('../errors');
const { forOwn, isUndefined } = require('lodash');

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
        next: status,
        user
      },
      handler: () => Case.query().patchAndFetchById(this.id, { status })
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
      handler: () => Case.query().patchAndFetchById(this.id, { data })
    });
  }

  static query() {
    return this.Model.query();
  }

  static db(db) {
    Object.defineProperty(this, 'Model', {
      value: Model.bindKnex(db),
      configurable: true
    });
  }

  static list() {
    return this.query().select();
  }

  static filterByParams(params) {
    let query = this.query().select();

    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];

      query.andWhere(builder => {
        statuses.map(status => {
          builder.orWhere('status', status);
        });
      });
    }

    if (params.data) {
      query.andWhere(builder => {
        builder.whereJsonSupersetOf('data', params.data);
      });
    }

    if (params.exclude) {
      query.andWhere(builder => {
        forOwn(params.exclude, (values, key) => {
          values = Array.isArray(values) ? values : [values];
          values.map(value => {
            builder.whereNot(key, value);
          });
        });
      });
    }
    
    const {
      limit,
      offset
    } = params;

    query = this.paginate({ query, limit, offset });

    return query;
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
      handler: () => this.Model.query().insert(model)
    });
  }

  static find(id) {
    return this.Model.query().findById(id)
      .then(model => {
        if (!model) {
          throw new NotFoundError();
        }
        return new Case(model);
      });
  }

  static paginate({ query, limit, offset }) {
    if (isUndefined(limit)) {
      limit = 100;
    }
    if (isUndefined(offset)) {
      offset = 0;
    }
    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);
    const page = offset / limit;

    return query
      .page(page, limit);
  }

}

module.exports = Case;
