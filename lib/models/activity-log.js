const { Model } = require('objection');

class ActivityLog extends Model {
  static get tableName() {
    return 'activity_log';
  }
}

module.exports = ActivityLog;
