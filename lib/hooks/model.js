class Model {

  constructor({ event, meta, model }) {
    this.event = event;
    this.meta = meta;
    this.model = model;
  }

  toJSON() {
    return {
      event: this.event,
      meta: this.meta,
      model: this.model
    };
  }

}

module.exports = Model;
