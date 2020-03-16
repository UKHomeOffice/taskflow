const { get } = require('lodash');
const ActivityLog = require('../../db/activity-log');

module.exports = () => {
  return model => {
    const now = new Date().toISOString();
    model.req = model.transaction._id;
    return ActivityLog.query(model.transaction).insert({
      caseId: model.id,
      changedBy: get(model, 'meta.user.profile.id'),
      eventName: get(model, 'event'),
      event: model,
      comment: model.comment,
      // activity log entries are inserted as one transaction,
      // manually add timestamps to preserve order
      createdAt: now,
      updatedAt: now
    });
  };
};
