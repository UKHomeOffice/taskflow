const { get } = require('lodash');
const ActivityLog = require('../../db/activity-log');

module.exports = () => {
  return model => {
    return ActivityLog.query(model.transaction).insert({
      caseId: model.id,
      changedBy: get(model, 'meta.user.profile.id'),
      eventName: get(model, 'event'),
      event: model,
      comment: model.comment
    });
  };
};
