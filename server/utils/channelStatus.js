const getChannelOpenStatusId = ({ db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const status = await db.channelStatuses.findOne({
        where: { status: { [db.Sequelize.Op.eq]: 'Open' } }
      });

      resolve(status ? status.id : null);
    } catch (e) {
      reject(e);
    }
  });
};

const getChannelClosedStatusId = ({ db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const status = await db.channelStatuses.findOne({
        where: { status: { [db.Sequelize.Op.eq]: 'Closed' } }
      });

      resolve(status ? status.id : null);
    } catch (e) {
      reject(e);
    }
  });
};

const getChannelFlaggedStatusId = ({ db }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const status = await db.channelStatuses.findOne({
        where: { status: { [db.Sequelize.Op.eq]: 'Flagged' } }
      });

      resolve(status ? status.id : null);
    } catch (e) {
      reject(e);
    }
  });
};

const createChannelStatusResponse = ({ ok, status, errors }) => {};
const createChannelStatusesResponse = ({ ok, statuses, errors }) => {};
module.exports = {
  getChannelOpenStatusId,
  getChannelClosedStatusId,
  getChannelFlaggedStatusId,
  createChannelStatusResponse,
  createChannelStatusesResponse
};
