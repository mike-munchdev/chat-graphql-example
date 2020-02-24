const convertErrors = require('../utils/convertErrors');

module.exports = {
  Query: {
    channelNotificationTypes: async (parent, args, { db }) => {
      const channelNotificationTypesDb = await db.channelNotificationTypes.findAll();
      return channelNotificationTypesDb.map(u =>
        convertKeysToCamelCase(u.toJSON())
      );
    },
    channelNotificationType: async (parent, { id }, { db }) => {
      const channelNotificationTypeDb = await db.channelNotificationTypes.findByPk(
        id
      );

      return channelNotificationTypeDb
        ? convertKeysToCamelCase(channelNotificationTypeDb.toJSON())
        : null;
    }
  },

  Mutation: {
    createChannelNotificationType: async (parent, args, { db }) => {
      try {
        const channelNotificationType = convertKeysToSnakeCase(args);
        const newChannelNotificationType = await db.channelNotificationTypes.create(
          channelNotificationType
        );
        return {
          ok: true,
          type: convertKeysToCamelCase(newChannelNotificationType.toJSON()),
          errors: null
        };
      } catch (e) {
        return {
          ok: false,
          type: null,
          errors: convertErrors(e, db)
        };
      }
    }
  }
};
