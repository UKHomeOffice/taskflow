const { Model } = require('objection');

class Case extends Model {

  static get tableName() {
    return 'cases';
  }

}

module.exports = Case;
