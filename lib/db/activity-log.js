const { Model } = require('objection');

class ActivityLog extends Model {
  static get tableName() {
    return 'activity_log';
  }

  static get relationMappings() {
    return {
      case: {
        relation: this.BelongsToOneRelation,
        modelClass: `${__dirname}/task`,
        join: {
          from: 'activity_log.caseId',
          to: 'cases.id'
        }
      }
    };
  }
}

module.exports = ActivityLog;
