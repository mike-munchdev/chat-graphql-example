const moment = require('moment');
const { withFilter } = require('apollo-server-express');

const convertErrors = require('../utils/convertErrors');

const {
  channelMessageIncludes
} = require('../sequelizeIncludes/channelMessages');

const {
  createChannelMessageResponse,
  createChannelMessagesResponse,
  addMessageToChannel
} = require('../utils/channelMessages');

const {
  CHANNEL_MESSAGE_ADDED,
  CHANNEL_UPDATED
} = require('../utils/constants');

const {
  createChannelResponse,
  updateChannelForNewMessage,
  upsertLastViewed
} = require('../utils/channels');
const pubsub = require('../utils/pubsub');

module.exports = {
  Query: {
    messagesForChannel: async (parent, { channelId }, { db }) => {
      try {
        const Op = db.Sequelize.Op;
        const messagesDb = await db.channelMessages.findAll({
          where: { channelId: { [Op.eq]: Number(channelId) } },
          include: channelMessageIncludes,
          order: [['date_sent', 'DESC']]
        });
        const response = createChannelMessagesResponse({
          ok: true,
          messages: messagesDb
        });

        return response;
      } catch (e) {
        return createChannelMessagesResponse({
          ok: false,
          errors: convertErrors(e, db)
        });
      }
    }
  },
  Mutation: {
    sendMessageToChannel: async (parent, { message }, { db, user }) => {
      try {
        const Op = db.Sequelize.Op;
        const { channelId, text } = message;
        const newMessage = await addMessageToChannel({
          db,
          channelId,
          text,
          user
        });

        const channelDb = await updateChannelForNewMessage({
          db,
          channelId,
          text,
          user
        });

        // update last viewed for current user
        const existingLastViewed = await db.channelLastViewed.findOne({
          where: {
            channelId: { [Op.eq]: channelId },
            user_id: { [Op.eq]: user.id }
          }
        });

        await upsertLastViewed({
          db,
          channelId,
          userId: user.id,
          existingLastViewed
        });

        const channelResponse = await createChannelResponse({
          db,
          user,
          channel: channelDb
        });
        // add notification
        pubsub.publish(CHANNEL_UPDATED, {
          channelUpdated: {
            ...channelResponse,
            updatePerformed: 'sendMessageToChannel'
          }
        });
        pubsub.publish(CHANNEL_UPDATED, {
          channelUpdated: {
            ...channelResponse,
            updatePerformed: 'receivedMessageFromChannel'
          }
        });

        const messageDb = await db.channelMessages.findByPk(newMessage.id, {
          include: channelMessageIncludes
        });

        pubsub.publish(CHANNEL_MESSAGE_ADDED, {
          channelMessageAdded: createChannelMessageResponse({
            ok: true,
            message: messageDb
          })
        });

        return createChannelMessageResponse({
          ok: true,
          message: messageDb
        });
      } catch (e) {
        return createChannelMessageResponse({
          ok: false,
          errors: convertErrors(e, db)
        });
      }
    },
    downloadChannelTranscript: async (parent, { channelId }, { db }) => {
      try {
        const Op = db.Sequelize.Op;
        const messagesDb = await db.channelMessages.findAll({
          where: { channelId: { [Op.eq]: Number(channelId) } },
          include: channelMessageIncludes,
          order: [['date_sent', 'ASC']]
        });

        const transcriptArray = messagesDb.map(msg => {
          const printDate = new Date(msg.date_sent).toLocaleString('en-US', {
            timeZone: 'America/Phoenix'
          });

          return `${msg.user.first_name
            .slice(0, 1)
            .toUpperCase()}.${msg.user.last_name
            .slice(0, 1)
            .toUpperCase()}. (${printDate}): ${msg.text}`;
        });

        return {
          ok: true,
          transcript: transcriptArray.join('\n'),
          errors: null
        };
      } catch (e) {
        return {
          ok: false,
          transcript: null,
          errors: convertErrors(e, db)
        };
      }
    }
  },
  Subscription: {
    channelMessageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CHANNEL_MESSAGE_ADDED),
        ({ channelMessageAdded: { message } }, { channelId }, { user }) => {
          return message.user.id !== user.id && message.channelId === channelId;
        }
      )
    }
  }
};
