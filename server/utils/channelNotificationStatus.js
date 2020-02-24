const {
  CHANNEL_INVITATION_REJECTED,
  CHANNEL_INVITATION_ACCEPTED,
  CHANNEL_INVITATION_ADDED,
  CHANNEL_NOTIFICATION_VIEWED,
  CHANNEL_MESSAGE_ADDED
} = require('./constants');

const getChannelNotificationStatusId = ({
  db,
  action = CHANNEL_INVITATION_ADDED
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      let slug = 'sent';
      switch (action) {
        case CHANNEL_INVITATION_ADDED:
          slug = 'sent';
          break;
        case CHANNEL_INVITATION_ACCEPTED:
          slug = 'accepted';
          break;
        case CHANNEL_INVITATION_REJECTED:
          slug = 'rejected';
          break;
        case CHANNEL_NOTIFICATION_VIEWED:
          slug = 'viewed';
          break;
      }

      const status = await db.channelNotificationStatuses.findOne({
        where: { slug: { [db.Sequelize.Op.eq]: slug } }
      });

      resolve(status ? status.id : null);
    } catch (e) {
      reject(e);
    }
  });
};
const getChannelNotificationTypeId = ({ db, action }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let slug = 'invitation';
      switch (action) {
        case CHANNEL_INVITATION_ADDED:
          slug = 'invitation';
          break;
        case CHANNEL_INVITATION_ACCEPTED:
          slug = 'invitation-accepted';
          break;
        case CHANNEL_INVITATION_REJECTED:
          slug = 'invitation-rejected';
          break;
        case CHANNEL_NOTIFICATION_VIEWED:
          slug = 'viewed';
          break;
        case CHANNEL_MESSAGE_ADDED:
          slug = 'new-channel-message';
          break;
      }

      const type = await db.channelNotificationTypes.findOne({
        where: { slug: { [db.Sequelize.Op.eq]: slug } }
      });

      resolve(type ? type.id : null);
    } catch (e) {
      reject(e);
    }
  });
};

const getChannelNotificationMessage = ({ action }) => {
  return new Promise(async (resolve, reject) => {
    try {
      switch (action) {
        case CHANNEL_INVITATION_ADDED:
          resolve('invited you to join an db support channel');
          break;
        case CHANNEL_INVITATION_ACCEPTED:
          resolve('accepted your invitation to join an db support channel');
          break;
        case CHANNEL_INVITATION_REJECTED:
          resolve('rejected your invitation to join an db support channel');
          break;
        case CHANNEL_MESSAGE_ADDED:
          resolve('New Message in channel');
          break;
        default:
          resolve('');
      }
    } catch (e) {
      reject(e);
    }
  });
};

const createChannelNotificationsResponse = ({
  ok,
  status = null,
  errors = null
}) => ({
  ok,
  status: status ? convertKeysToCamelCase(status.toJSON()) : status,
  errors
});

const createChannelNotificationssResponse = ({
  ok,
  status = null,
  errors = null
}) => ({
  ok,
  status: status ? status.map(i => convertKeysToCamelCase(i.toJSON())) : [],
  errors
});
module.exports = {
  getChannelNotificationStatusId,
  getChannelNotificationTypeId,
  createChannelNotificationsResponse,
  createChannelNotificationssResponse,
  getChannelNotificationMessage
};
