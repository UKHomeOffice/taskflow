const { get } = require('lodash');
const ActivityLog = require('../../models/activity-log');

module.exports = () => {
  return model => {
    console.log(model);

    return ActivityLog.query().insert({
      caseId: model.id,
      changedBy: get(model, 'meta.user.id'),
      eventName: get(model, 'event'),
      event: model,
      comment: get(model, 'meta.payload.comment')
    });
  };
};
