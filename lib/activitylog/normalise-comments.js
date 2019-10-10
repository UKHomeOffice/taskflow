module.exports = activityLog => {
  if (!activityLog.length) {
    return activityLog;
  }

  const deletedCommentIds = activityLog.filter(log => log.eventName === 'delete-comment').map(log => log.event.meta.id);

  const updatedComments = activityLog
    .filter(log => log.eventName === 'update-comment')
    .sort((a, b) => a.updatedAt <= b.updatedAt ? 1 : -1); // most recent is first

  return activityLog
    .filter(log => log.eventName !== 'delete-comment' && log.eventName !== 'update-comment')
    .map(log => {
      if (log.eventName === 'comment') {
        if (deletedCommentIds.includes(log.id)) {
          return {
            ...log,
            deleted: true,
            comment: null
          };
        }

        // there may be multiple updates for this comment but first one will be most recent so ignore the rest
        const updateComment = updatedComments.find(uc => uc.event.meta.id === log.id);

        if (updateComment) {
          return {
            ...log,
            comment: updateComment.comment
          };
        }
      }

      return log;
    });
};
