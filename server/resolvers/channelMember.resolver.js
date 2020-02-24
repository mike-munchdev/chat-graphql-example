const convertErrors = require('../utils/convertErrors');
const {
  channelMemberIncludes
} = require('../sequelizeIncludes/channelMembers');

const {
  createChannelMemberResponse,
  createChannelMembersResponse
} = require('../utils/channelMembers');

module.exports = {
  Query: {
    membersForChannel: async (parent, { channelId }, { db }) => {
      try {
        const Op = db.Sequelize.Op;
        const membersDb = await db.channelMembers.findAll({
          where: { channelId: { [Op.eq]: Number(channelId) } },
          include: channelMemberIncludes,
          order: [['date_joined', 'DESC']]
        });
        return createChannelMembersResponse({
          ok: true,
          members: membersDb
        });
      } catch (e) {
        return createChannelMembersResponse({
          ok: false,
          errors: convertErrors(e, db)
        });
      }
    }
  },

  Mutation: {
    createChannelMember: async (parent, args, { db }) => {
      try {
        throw new Error('Not Implemented');
      } catch (e) {
        return createChannelMemberResponse({
          ok: false,
          errors: convertErrors(e, db)
        });
      }
    }
  }
};
