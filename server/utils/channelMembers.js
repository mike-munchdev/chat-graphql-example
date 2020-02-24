const createChannelMember = ({ db, user, channelId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newChannelMember = Object.assign(
        {},
        {
          user_id: user.id,
          channelId: Number(channelId)
        }
      );

      // create notification
      const channelMember = await db.channelMembers.create(newChannelMember);

      resolve(channelMember);
    } catch (e) {
      reject(e);
    }
  });
};

const createChannelMemberResponse = ({ ok, member = null, errors = null }) => ({
  ok,
  member: member ? convertKeysToCamelCase(member.toJSON()) : member,
  errors
});

const createChannelMembersResponse = ({
  ok,
  members = null,
  errors = null
}) => ({
  ok,
  members: members ? members.map(m => convertKeysToCamelCase(m.toJSON())) : [],
  errors
});

module.exports = {
  createChannelMember,
  createChannelMemberResponse,
  createChannelMembersResponse
};
