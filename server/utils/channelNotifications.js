const createChannelNotificationsResponse = ({
  ok,
  notifications = null,
  errors = null
}) => ({
  ok,
  notifications: notifications
    ? notifications.map(c => convertKeysToCamelCase(c.toJSON()))
    : [],
  errors
});

const createChannelNotificationResponse = ({
  ok,
  notification = null,
  errors = null
}) => {
  return {
    ok,
    notification: notification
      ? convertKeysToCamelCase(notification.toJSON())
      : notification,
    errors
  };
};

const createSimpleResponse = ({ ok, errors = null }) => ({
  ok,
  errors
});

const createChannelNotification = ({
  db,
  notified_by_user_id,
  notified_user_id,
  channelId,
  notification_status_id,
  notification_type_id,
  message,
  link_id = null,
  rejected_reason = null
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newNotification = Object.assign(
        {},
        {
          notified_by_user_id,
          notified_user_id,
          channelId,
          notification_status_id,
          notification_type_id,
          message,
          link_id,
          rejected_reason
        }
      );
      const createStatusNotification = await db.channelNotifications.create(
        newNotification
      );
      resolve(createStatusNotification);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createChannelNotificationsResponse,
  createChannelNotificationResponse,
  createSimpleResponse,
  createChannelNotification
};
