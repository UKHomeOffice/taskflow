const uuid = require('uuid/v4');
const Model = require('../db/case');
const { NotFoundError, InvalidRequestError, UnauthorisedError } = require('../errors');
const { forOwn } = require('lodash');
const normaliseComments = require('../activitylog/normalise-comments');

class Case {

  constructor(model = {}) {
    this.id = model.id;
    this._status = model.status;
    this._data = model.data;
    this._activityLog = normaliseComments(model.activityLog || []);
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

  patch(data, opts) {
    return Case.query().findById(this.id)
      .then(result => {
        return this.update({ ...result.data, ...data }, opts);
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
        builder.orderBy('createdAt', 'DESC');
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

  comment(comment, { hooks, user, payload }) {
    return hooks.invoke({
      event: 'comment',
      id: this.id,
      meta: {
        user,
        comment,
        payload
      },
      handler: () => Promise.resolve()
    });
  }

  userAuthoredComment(commentId, user) {
    console.log({
      commentId,
      user
    });

    const comment = this._activityLog.find(log => log.id === commentId);
    return comment.changedBy === user.profile.id;
  }

  updateComment(id, comment, { hooks, user, payload }) {
    if (!this.userAuthoredComment(id, user)) {
      throw new UnauthorisedError('only comment authors may update a comment');
    }

    return hooks.invoke({
      event: 'update-comment',
      id: this.id,
      meta: {
        id,
        user,
        comment,
        payload
      },
      handler: () => Promise.resolve()
    });
  }

  deleteComment(id, { hooks, user }) {
    if (!this.userAuthoredComment(id, user)) {
      throw new UnauthorisedError('only comment authors may delete a comment');
    }

    return hooks.invoke({
      event: 'delete-comment',
      id: this.id,
      meta: {
        id,
        user
      },
      handler: () => Promise.resolve()
    });
  }
}

module.exports = Case;
