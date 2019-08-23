const { Model } = require('objection');

class Case extends Model {

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }

  static get tableName() {
    return 'cases';
  }

  static get relationMappings() {
    return {
      activityLog: {
        relation: this.HasManyRelation,
        modelClass: `${__dirname}/activity-log`,
        join: {
          from: 'cases.id',
          to: 'activity_log.caseId'
        }
      }
    };
  }
}

module.exports = Case;
