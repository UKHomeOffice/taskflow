const { Model } = require('objection');

class ActivityLog extends Model {
  static get tableName() {
    return 'activity_log';
  }

  static get relationMappings() {
    return {
      case: {
        relation: this.BelongsToOneRelation,
        modelClass: `${__dirname}/case`,
        join: {
          from: 'activity_log.caseId',
          to: 'cases.id'
        }
      }
    };
  }
}

module.exports = ActivityLog;
