const { get } = require('lodash');
const ActivityLog = require('../../models/activity-log');

module.exports = db => {
  return model => {
    return ActivityLog.query(db).insert({
      caseId: model.id,
      changedBy: get(model, 'meta.user.id'),
      eventName: get(model, 'event'),
      event: model,
      comment: get(model, 'meta.payload.comment')
    });
  };
};
