const { get } = require('lodash');
const ActivityLog = require('../../db/activity-log');

module.exports = db => {
  return model => {
    return ActivityLog.query(db).insert({
      caseId: model.id,
      changedBy: get(model, 'meta.user.profile.id'),
      eventName: get(model, 'event'),
      event: model,
      comment: model.comment
    });
  };
};
