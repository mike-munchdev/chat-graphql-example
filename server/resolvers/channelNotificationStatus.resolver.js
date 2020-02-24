const convertErrors = require('../utils/convertErrors');

module.exports = {
  Query: {
    channelNotificationStatuses: async (parent, args, { db }) => {
      const channelNotificationStatusesDb = await db.channelNotificationStatuses.findAll();
      return channelNotificationStatusesDb.map(u =>
        convertKeysToCamelCase(u.toJSON())
      );
    },
    channelNotificationStatus: async (parent, { id }, { db }) => {
      const channelNotificationStatusDb = await db.channelNotificationStatuses.findByPk(
        id
      );

      return channelNotificationStatusDb
        ? convertKeysToCamelCase(channelNotificationStatusDb.toJSON())
        : null;
    }
  },

  Mutation: {
    createChannelNotificationStatus: async (parent, args, { db }) => {
      try {
        const channelNotificationStatus = convertKeysToSnakeCase(args);
        const newChannelNotificationStatus = await db.channelNotificationStatuses.create(
          channelNotificationStatus
        );
        return {
          ok: true,
          status: convertKeysToCamelCase(newChannelNotificationStatus.toJSON()),
          errors: null
        };
      } catch (e) {
        return {
          ok: false,
          status: null,
          errors: convertErrors(e, db)
        };
      }
    }
  }
};
