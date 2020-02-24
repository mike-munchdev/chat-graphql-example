const convertErrors = require('../utils/convertErrors');

module.exports = {
  Query: {
    channelTypes: async (parent, args, { db }) => {
      const channelTypesDb = await db.channelTypes.findAll();

      return channelTypesDb.map(u => convertKeysToCamelCase(u.toJSON()));
    },
    channelType: async (parent, { id }, { db }) => {
      const channelTypeDb = await db.channelTypes.findByPk(id);

      return channelTypeDb
        ? convertKeysToCamelCase(channelTypeDb.toJSON())
        : null;
    },
    externalChannelTypes: async (parent, args, { db }) => {
      const Op = db.Sequelize.Op;
      const channelTypesDb = await db.channelTypes.findAll({
        where: { is_external: { [Op.eq]: 1 } }
      });

      return channelTypesDb.map(u => convertKeysToCamelCase(u.toJSON()));
    }
  },
  Mutation: {
    createChannelType: async (parent, args, { db }) => {
      try {
        const channelType = convertKeysToSnakeCase(args);
        const newChannelType = await db.channelTypes.create(channelType);
        return {
          ok: true,
          channelType: convertKeysToCamelCase(newChannelType.toJSON()),
          errors: null
        };
      } catch (e) {
        return {
          ok: false,
          channelType: null,
          errors: convertErrors(e, db)
        };
      }
    }
  }
};
