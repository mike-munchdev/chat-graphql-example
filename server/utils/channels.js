const { capitalize } = require('lodash');
const asyncForEach = require('../utils/asyncForEach');
const { setLastModifiedByAndAt } = require('../utils/commonFields');

const {
  channelMemberIncludes
} = require('../sequelizeIncludes/channelMembers');

const {
  channelIncludesWithoutChannelStatus,
  allChannelIncludes
} = require('../sequelizeIncludes/channels');

const { getUnreadMessageCount } = require('../utils/channelMessages');

const getAllChannelUserIds = ({ db, channelId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Op = db.Sequelize.Op;
      const channel = await db.channels.findByPk(channelId, {
        attributes: ['assignedToId', 'createdById']
      });

      const members = await db.channelMembers.findAll({
        where: {
          channelId: { [Op.eq]: channelId }
        },
        include: channelMemberIncludes
      });

      resolve([
        ...members.map(m => m.userId),
        channel.assignedToId || -1,
        channel.createdById
      ]);
    } catch (e) {
      reject(e);
    }
  });
};
const getInternalChannelUsersIds = ({ db, channelId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Op = db.Sequelize.Op;
      const channel = await db.channels.findByPk(channelId, {
        attributes: ['assignedToId']
      });

      const members = await db.channelMembers.findAll({
        where: {
          channelId: { [Op.eq]: channelId }
        },
        include: channelMemberIncludes
      });

      resolve(members.map(m => m.toJSON()));
    } catch (e) {
      reject(e);
    }
  });
};
const updateChannelForNewMessage = ({ db, channelId, text, user }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const channel = await db.channels.findByPk(channelId);
      if (!channel) throw new Error(`No Channel Found for id: ${channelId}`);
      setLastModifiedByAndAt({ obj: channel, user });
      channel.last_message_snippet = text.slice(0, 50);

      await channel.save();
      const returnChannel = await db.channels.findByPk(channel.id, {
        include: allChannelIncludes
      });

      resolve(returnChannel);
    } catch (e) {
      reject(e);
    }
  });
};
const getChannels = ({ filters, user, db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Op = db.Sequelize.Op;

      const isExternal = isExternalUser(user);

      let allIncludes;
      let whereClause = {};

      const myFilters = filters || {};

      const {
        keywords,
        members = [],
        startDate,
        endDate,
        assigned,
        status
      } = myFilters;
      let statusInclude;

      if (isExternal) {
        whereClause = { created_by: { [Op.eq]: user.id } };
      } else {
        const channelTypes = await db.channelTypes.findAll({
          where: { is_external: { [Op.eq]: 1 } }
        });

        switch (assigned) {
          case 'un':
            whereClause = {
              ...whereClause,
              assignedToId: { [Op.eq]: null }
            };
            break;
          case 'all':
            break;
          default:
            // "my"
            const channelMembers = await db.channelMembers.findAll({
              where: {
                user_id: { [Op.eq]: user.id }
              }
            });

            if (channelMembers.length) {
              const memberChannels = channelMembers.map(m => m.channelId);

              whereClause = {
                ...whereClause,
                [Op.or]: {
                  id: { [Op.in]: memberChannels },
                  assignedToId: { [Op.eq]: user.id }
                }
              };
            } else
              whereClause = {
                ...whereClause,
                assignedToId: { [Op.eq]: user.id }
              };

            break;
        }

        if (isClaimsAnalystUser(user)) {
          const claimsChannelType = channelTypes.find(
            t => t.type === 'Claim Status'
          );
          whereClause = {
            ...whereClause,
            channelTypeId: { [Op.eq]: claimsChannelType.id },
            account_id: {
              [Op.in]: user.accounts.map(a => Number(a.account_id))
            }
          };
        } else if (isPatientChoiceUser(user)) {
          const patientChoiceChannelType = channelTypes.find(
            t => t.type === 'Patient Choice'
          );
          whereClause = {
            ...whereClause,
            channelTypeId: { [Op.eq]: patientChoiceChannelType.id },
            account_id: {
              [Op.in]: user.accounts.map(a => Number(a.account_id))
            }
          };
        }
      }

      if (status) {
        statusInclude = {
          association: 'channelStatus',
          required: true,
          where: { status: { [Op.eq]: capitalize(status.trim()) } }
        };
      } else {
        statusInclude = {
          association: 'channelStatus',
          required: true
        };
      }

      allIncludes = [...channelIncludesWithoutChannelStatus, statusInclude];

      if (startDate || endDate) {
        const parseDate = string => {
          const date = string.split('-');
          const year = Number(date[0]);
          const month = Number(date[1]) - 1;
          const day = Number(date[2]);
          return new Date(Date.UTC(year, month, day));
        };

        if (startDate && endDate) {
          whereClause = {
            ...whereClause,
            created_at: {
              [Op.and]: [
                { [Op.gte]: parseDate(startDate) },
                { [Op.lte]: parseDate(endDate) }
              ]
            }
          };
        } else if (startDate && !endDate) {
          whereClause = {
            ...whereClause,
            created_at: {
              [Op.gte]: parseDate(startDate)
            }
          };
        } else if (endDate && !startDate) {
          whereClause = {
            ...whereClause,
            created_at: {
              [Op.lte]: parseDate(endDate)
            }
          };
        }
      }

      let channelsDb = await db.channels.findAll({
        include: allIncludes,
        where: whereClause,
        order: [['last_modified_at', 'DESC']]
      });

      let channels = channelsDb.map(c => c.id);
      if (keywords) {
        const messageChannels = await db.channelMessages.findAll({
          attributes: ['channelId'],
          where: {
            text: {
              [Op.like]: `%${keywords}%`
            },
            channelId: {
              [Op.in]: channels
            }
          }
        });

        const filteredTextChannels = messageChannels
          ? [...new Set(messageChannels.map(m => m.channelId))]
          : channels;

        channelsDb = channelsDb.filter(c =>
          filteredTextChannels.includes(c.id)
        );
      }

      if (members.length) {
        const membersArray = members.map(m => Number(m.id) || 0);
        let memberChannels = await db.channelMembers.findAll({
          attributes: ['channelId'],
          where: {
            user_id: {
              [Op.in]: membersArray
            },
            channelId: {
              [Op.in]: channels
            }
          }
        });

        let assignedToChannels = await db.channels.findAll({
          attributes: ['id'],
          where: {
            id: {
              [Op.in]: channels
            },
            assignedToId: {
              [Op.in]: membersArray
            }
          }
        });

        let createdByChannels = await db.channels.findAll({
          attributes: ['id'],
          where: {
            id: {
              [Op.in]: channels
            },
            created_by: {
              [Op.in]: membersArray
            }
          }
        });

        memberChannels = memberChannels
          ? memberChannels.map(m => m.channelId)
          : [];

        assignedToChannels = assignedToChannels
          ? assignedToChannels.map(a => a.id)
          : [];

        createdByChannels = createdByChannels
          ? createdByChannels.map(a => a.id)
          : [];

        const filteredMemberChannels = [
          ...new Set([
            ...assignedToChannels,
            ...memberChannels,
            ...createdByChannels
          ])
        ];

        channelsDb = channelsDb.filter(c =>
          filteredMemberChannels.includes(c.id)
        );
      }

      resolve(channelsDb);
    } catch (e) {
      reject(e);
    }
  });
};
const getChannel = ({ user, db, channelId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isVisibleToUser = await channelVisibleToUser({
        channelId,
        user,
        db
      });

      if (!isVisibleToUser)
        throw new Error('You do not have access to this channel.');

      let channelsDb = await db.channels.findByPk(channelId, {
        include: allChannelIncludes
      });
      resolve(channelsDb);
    } catch (e) {
      reject(e);
    }
  });
};

const channelVisibleToUser = ({ channelId, user, db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Op = db.Sequelize.Op;
      const channel = await db.channels.findByPk(channelId);
      const channelTypes = await db.channelTypes.findAll({
        where: { is_external: { [Op.eq]: 1 } }
      });

      const isAdmin = isAdminUser(user) || isITSupervisor(user);
      if (isAdmin) {
        resolve(true);
      } else if (isClaimsAnalystUser(user)) {
        const claimsChannelType = channelTypes.find(
          t => t.type === 'Claim Status'
        );
        const accountIndex = user.accounts.findIndex(
          a => a.account_id === channel.account_id
        );
        resolve(
          Number(channel.channelTypeId) === Number(claimsChannelType.id) &&
            accountIndex >= 0
        );
      } else if (isPatientChoiceUser(user)) {
        const patientChoiceChannelType = channelTypes.find(
          t => t.type === 'Patient Choice'
        );

        const accountIndex = user.accounts.findIndex(
          a => a.account_id === channel.account_id
        );
        resolve(
          Number(channel.channelTypeId) ===
            Number(patientChoiceChannelType.id) && accountIndex >= 0
        );
      } else if (isExternalUser(user)) {
        resolve(Number(channel.created_by) === Number(user.id));
      } else {
        resolve(false);
      }
    } catch (e) {
      console.log('error', e);
      reject(e);
    }
  });
};

const channelVisibleToUserWithUniqueId = ({ uniqueId, user, db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Op = db.Sequelize.Op;
      const channel = await db.channels.findOne({
        where: { unique_id: { [Op.eq]: uniqueId } }
      });
      const isVisible = await channelVisibleToUser({
        channelId: channel.id,
        user,
        db
      });
      resolve(isVisible);
    } catch (e) {
      reject(e);
    }
  });
};

const upsertLastViewed = ({ db, channelId, userId, existingLastViewed }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (existingLastViewed) {
        existingLastViewed.last_viewed_at = new Date();

        await existingLastViewed.save();
        resolve(existingLastViewed);
      } else {
        const lastViewed = await db.channelLastViewed.create(
          {
            channelId: channelId,
            user_id: userId,
            last_viewed_at: new Date()
          },
          {}
        );
        resolve(lastViewed);
      }
    } catch (e) {
      reject(e);
    }
  });
};

const createChannelResponse = ({ channel, user, db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const unreadCount = await getUnreadMessageCount({
        db,
        channelId: channel.id,
        user
      });

      resolve({
        ok: true,
        channel: {
          ...convertKeysToCamelCase(channel.toJSON()),
          unreadMessageCount: unreadCount
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
const addUnreadCountToChannelsArray = ({ channels, user, db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let channelsWithUnreadCount = [];
      await asyncForEach(channels, async c => {
        const unreadCount = await getUnreadMessageCount({
          db,
          channelId: c.id,
          user
        });
        channelsWithUnreadCount = [
          ...channelsWithUnreadCount,
          {
            ...convertKeysToCamelCase(c.toJSON()),
            unreadMessageCount: unreadCount
          }
        ];
      });

      resolve(channelsWithUnreadCount);
    } catch (e) {
      reject(e);
    }
  });
};

const createChannelsResponse = ({ channels, user, db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const channelsWithUnreadCount = await addUnreadCountToChannelsArray({
        channels,
        user,
        db
      });

      resolve({
        ok: true,
        channels: channelsWithUnreadCount
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getChannel,
  getChannels,
  updateChannelForNewMessage,
  createChannelResponse,
  createChannelsResponse,
  getInternalChannelUsersIds,
  getAllChannelUserIds,
  channelVisibleToUser,
  channelVisibleToUserWithUniqueId,
  upsertLastViewed
};
