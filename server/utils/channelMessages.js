const {
  updateChannelForNewMessage,
  getInternalChannelUsersIds,
  createChannelResponse
} = require('../utils/channels');
const { setLastModifiedByAndAt } = require('../utils/commonFields');
const addMessageToChannel = ({ db, channelId, text, user }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const messageObj = db.channelMessages.build();
      const newMessage = Object.assign(
        {},
        messageObj.toJSON(),
        convertKeysToSnakeCase({ channelId, text, dateSent: new Date() })
      );

      setLastModifiedByAndAt({ obj: newMessage, user });

      newMessage.user_id = user.id;
      const newMessageDb = await db.channelMessages.create(newMessage);

      resolve(newMessageDb);
    } catch (e) {
      reject(e);
    }
  });
};
const getUnreadMessageCount = ({ db, channelId, user }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Op = db.Sequelize.Op;
      const unreadMessageCount = 1;

      const existingLastViewed = await db.channelLastViewed.findOne({
        where: {
          channelId: { [Op.eq]: channelId },
          user_id: { [Op.eq]: user.id }
        },

        attributes: ['last_viewed_at'],
        raw: true
      });

      let messageCount;
      if (existingLastViewed) {
        messageCount = await db.channelMessages.count({
          where: {
            date_sent: { [Op.gt]: existingLastViewed.last_viewed_at },
            channelId: { [Op.eq]: channelId }
          }
        });
      } else {
        messageCount = await db.channelMessages.count({
          where: {
            channelId: { [Op.eq]: channelId }
          }
        });
      }

      resolve(messageCount);
    } catch (e) {
      reject(e);
    }
  });
};

const createChannelMessageResponse = ({
  ok,
  message = null,
  errors = null
}) => ({
  ok,
  message: message ? convertKeysToCamelCase(message.toJSON()) : message,
  errors
});

const createChannelMessagesResponse = ({
  ok,
  messages = null,
  errors = null
}) => ({
  ok,
  messages: messages
    ? messages.map(m => convertKeysToCamelCase(m.toJSON()))
    : [],
  errors
});
module.exports = {
  createChannelMessageResponse,
  createChannelMessagesResponse,
  addMessageToChannel,
  getUnreadMessageCount
};
