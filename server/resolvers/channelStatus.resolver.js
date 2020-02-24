const convertErrors = require('../utils/convertErrors');

module.exports = {
  Query: {
    getChannelStatuses: async (parent, args, { db }) => {
      try {
        const channelStatusesDb = await db.channelStatuses.findAll();

        return {
          ok: true,
          statuses: channelStatusesDb.map(u =>
            convertKeysToCamelCase(u.toJSON())
          ),
          errors: null
        };
      } catch (e) {
        return {
          ok: false,
          statuses: null,
          errors: convertErrors(e, db)
        };
      }
    },
    getChannelStatus: async (parent, { id }, { db }) => {
      try {
        const channelStatusDb = await db.channelStatuses.findByPk(id);
        return {
          ok: true,
          status: convertKeysToCamelCase(channelStatusDb.toJSON()),
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
  },

  Mutation: {
    createChannelStatus: async (parent, args, { db }) => {
      try {
        const channelStatus = convertKeysToSnakeCase(args);
        const newChannelStatus = await db.channelStatuses.create(channelStatus);
        return {
          ok: true,
          status: convertKeysToCamelCase(newChannelStatus.toJSON()),
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
