const uuid = require('uuid/v4');
const Model = require('../db/case');
const { NotFoundError, InvalidRequestError } = require('../errors');
const { forOwn } = require('lodash');

class Case {

  constructor(model = {}) {
    this.id = model.id;
    this._status = model.status;
    this._data = model.data;
    this._activityLog = model.activityLog || [];
    this._createdAt = model.createdAt;
    this._updatedAt = model.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      status: this._status,
      data: this._data,
      activityLog: this._activityLog,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  status(status, { hooks, user, payload }) {
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
        user,
        payload
      },
      handler: () => Case.query().patchAndFetchById(this.id, { status })
    });
  }

  update(data, { hooks, user, payload }) {
    return hooks.invoke({
      event: 'update',
      id: this.id,
      meta: {
        data,
        user,
        payload
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
      offset,
      sort
    } = params;

    query = this.paginate({ query, limit, offset });
    query = this.orderBy({ query, sort });

    return query;
  }

  static create(data, { hooks, user, payload }) {
    const model = {
      id: uuid(),
      status: 'new',
      data
    };
    return hooks.invoke({
      event: 'create',
      id: model.id,
      meta: {
        user,
        data,
        payload
      },
      handler: () => this.Model.query().insert(model)
    });
  }

  static find(id) {
    return this.Model.query().findById(id)
      .eager('[activityLog]')
      .modifyEager('[activityLog]', builder => {
        // we only care about logs of status changes
        builder.where('eventName', 'like', 'status%')
          // ignore auto-forwarded status changes
          .andWhere('eventName', '!=', 'status:with-ntco:ntco-endorsed')
          .orderBy('createdAt', 'ASC');
      })
      .then(model => {
        if (!model) {
          throw new NotFoundError();
        }
        return new Case(model);
      });
  }

  static paginate({ query, limit = 100, offset = 0 }) {

    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);
    const page = offset / limit;

    return query
      .page(page, limit);
  }

  static orderBy({ query, sort = {} }) {
    if (!sort.column) {
      return query;
    }
    if (typeof sort.ascending === 'string') {
      sort.ascending = sort.ascending === 'true';
    }
    return query
      .orderBy(sort.column, sort.ascending ? 'asc' : 'desc');
  }
}

module.exports = Case;
