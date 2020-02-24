const { withFilter } = require('apollo-server-express');

const convertErrors = require('../utils/convertErrors');
const {
  getChannelOpenStatusId,
  getChannelClosedStatusId,
  getChannelFlaggedStatusId
} = require('../utils/channelStatus');
const {
  createChannelResponse,
  createChannelsResponse,
  getChannels,
  channelVisibleToUser,
  channelVisibleToUserWithUniqueId,
  upsertLastViewed
} = require('../utils/channels');
const {
  setCreatedByAndAt,
  setLastModifiedByAndAt
} = require('../utils/commonFields');
const {
  channelIncludesWithoutChannelStatus,
  allChannelIncludes,
  allChannelIncludesWithHistory
} = require('../sequelizeIncludes/channels');

const { CHANNEL_UPDATED, CHANNEL_ADDED } = require('../utils/constants');
const {
  addMessageToChannel,
  getUnreadMessageCount
} = require('../utils/channelMessages');
const { createChannelMember } = require('../utils/channelMembers');
const pubsub = require('../utils/pubsub');

module.exports = {
  Query: {
    getChannelByUniqueId: async (parent, { id }, { db, user }) => {
      try {
        const Op = db.Sequelize.Op;
        const channelDb = await db.channels.findOne({
          where: { unique_id: { [Op.eq]: id } },
          include: allChannelIncludes
        });

        return await createChannelResponse({ db, user, channel: channelDb });
      } catch (e) {
        return {
          ok: false,
          errors: convertErrors(e, db)
        };
      }
    },
    getChannelsWithFilters: async (parent, { filters }, { db, user }) => {
      try {
        let channels;

        if (filters.uniqueId) {
          const isVisible = await channelVisibleToUserWithUniqueId({
            uniqueId: filters.uniqueId,
            user,
            db
          });
          if (!isVisible)
            throw new Error('You do not have access to this channel!');

          const Op = db.Sequelize.Op;
          channels = await db.channels.findAll({
            where: { unique_id: { [Op.in]: [filters.uniqueId] } },
            include: allChannelIncludes
          });
        } else {
          channels = await getChannels({ filters, user, db });
        }
        const response = await createChannelsResponse({
          db,
          user,
          channels
        });

        return response;
      } catch (e) {
        return {
          ok: false,
          errors: convertErrors(e, db)
        };
      }
    }
  },
  Mutation: {
    createExternalChannel: async (
      parent,
      { channelTypeId, channelDescription },
      { db, user }
    ) => {
      try {
        const isExternal = isExternalUser(user);

        if (isExternal) {
          const openStatusId = await getChannelOpenStatusId({ db });
          const name = `external-${
            user.id
          }-${channelTypeId}-${new Date().toISOString()}`;
          const channel = Object.assign(
            {},
            {
              name: name,
              friendly_name: channelDescription.slice(0, 20),
              channelTypeId: channelTypeId,
              account_id: user.accounts[0].account_id,
              channelStatusId: openStatusId
            }
          );

          setCreatedByAndAt({ obj: channel, user });
          setLastModifiedByAndAt({ obj: channel, user });

          const newChannel = await db.channels.create(channel);
          const allIncludes = allChannelIncludes;
          const channelDb = await db.channels.findByPk(newChannel.id, {
            include: allIncludes
          });

          const channelResponse = await createChannelResponse({
            db,
            user,
            channel: channelDb
          });

          const newMessage = await addMessageToChannel({
            db,
            channelId: channelDb.id,
            text: channelDescription,
            user
          });

          await createChannelMember({
            db,
            user,
            channelId: channelDb.id
          });
          // send update
          pubsub.publish(CHANNEL_ADDED, { channelAdded: channelResponse });

          return channelResponse;
        } else {
          throw new Error('Only external users can create support channels');
        }
      } catch (e) {
        return {
          ok: false,
          errors: convertErrors(e, db)
        };
      }
    },
    closeExternalChannel: async (
      parent,
      { channelId, reason },
      { db, user }
    ) => {
      try {
        const channelVisible = await channelVisibleToUser({
          channelId,
          user,
          db
        });
        if (!channelVisible)
          throw new Error('You do not have access to this channel!');

        const allIncludes = allChannelIncludes;
        const channelDb = await db.channels.findByPk(channelId, {
          include: allIncludes
        });
        channelDb.channelStatusId = await getChannelClosedStatusId({ db });
        channelDb.closed_reason = reason;
        setLastModifiedByAndAt({ obj: channelDb, user });

        await channelDb.save();

        const channel = await db.channels.findByPk(channelId, {
          include: allIncludes
        });

        // 2. send email to external user when internal user responds
        await emailExternalUserWhenChannelIsClosed({ channel, db });

        const channelResponse = await createChannelResponse({
          db,
          user,
          channel: channel
        });

        // add notification
        pubsub.publish(CHANNEL_UPDATED, {
          channelUpdated: {
            ...channelResponse,
            updatePerformed: 'closeExternalChannel'
          }
        });

        return channelResponse;
      } catch (e) {
        return {
          ok: false,
          errors: convertErrors(e, db)
        };
      }
    },
    acceptExternalChannel: async (parent, { channelId }, { db, user }) => {
      try {
        const channelVisible = await channelVisibleToUser({
          channelId,
          user,
          db
        });

        if (!channelVisible)
          throw new Error('You do not have access to this channel!');

        const Op = db.Sequelize.Op;

        const allIncludes = allChannelIncludes;

        await db.channels.update(
          { assignedToId: Number(user.id) },
          {
            where: { id: { [Op.eq]: channelId } }
          }
        );
        await createChannelMember({
          db,
          user,
          channelId
        });
        const channelDb = await db.channels.findByPk(channelId, {
          include: allIncludes
        });

        const channelResponse = await createChannelResponse({
          db,
          user,
          channel: channelDb
        });

        // send notification
        pubsub.publish(CHANNEL_UPDATED, {
          channelUpdated: {
            ...channelResponse,
            updatePerformed: 'acceptExternalChannel'
          }
        });

        return channelResponse;
      } catch (e) {
        return {
          ok: false,
          errors: convertErrors(e, db)
        };
      }
    },
    markChannelViewed: async (parent, { channelId }, { db, user }) => {
      try {
        const Op = db.Sequelize.Op;
        const existingLastViewed = await db.channelLastViewed.findOne({
          where: {
            channelId: { [Op.eq]: channelId },
            user_id: { [Op.eq]: user.id }
          }
        });

        const lastViewed = await upsertLastViewed({
          db,
          channelId,
          userId: user.id,
          existingLastViewed
        });

        const allIncludes = allChannelIncludes;

        const channelDb = await db.channels.findByPk(channelId, {
          include: allIncludes
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
            updatePerformed: 'markChannelViewed'
          }
        });

        return channelResponse;
      } catch (e) {
        return {
          ok: false,
          errors: convertErrors(e, db)
        };
      }
    },
    flagExternalChannel: async (
      parent,
      { channelId, reason },
      { db, user }
    ) => {
      try {
        const channelVisible = await channelVisibleToUser({
          channelId,
          user,
          db
        });
        if (!channelVisible)
          throw new Error('You do not have access to this channel!');

        const allIncludes = allChannelIncludes;
        const channelDb = await db.channels.findByPk(channelId, {
          include: allIncludes
        });
        channelDb.channelStatusId = await getChannelFlaggedStatusId({
          db
        });
        channelDb.flagged_reason = reason;
        setLastModifiedByAndAt({ obj: channelDb, user });
        await channelDb.save();

        const returnChannel = await db.channels.findByPk(channelDb.id, {
          include: allIncludes
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
            updatePerformed: 'flagExternalChannel'
          }
        });

        return channelResponse;
      } catch (e) {
        return {
          ok: false,
          errors: convertErrors(e, db)
        };
      }
    }
  },
  Subscription: {
    channelUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CHANNEL_UPDATED),
        async (payload, args, { user, db }) => {
          try {
            if (payload) {
              const { channel } = payload.channelUpdated;

              const channelVisible = await channelVisibleToUser({
                channelId: channel.id,
                user,
                db
              });
              if (channelVisible) {
                const unreadMessageCount = await getUnreadMessageCount({
                  db,
                  channelId: channel.id,
                  user
                });
                payload.channelUpdated.channel.unreadMessageCount = unreadMessageCount;
              }
              return channelVisible;
            }
          } catch (e) {
            return false;
          }
        }
      )
    },
    channelAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CHANNEL_ADDED),
        async (payload, args, { user, db }) => {
          try {
            if (payload) {
              const { channel } = payload.channelAdded;

              const channelVisible = await channelVisibleToUser({
                channelId: channel.id,
                user,
                db
              });

              return channelVisible;
            }
          } catch (e) {
            return false;
          }
        }
      )
    }
  }
};
