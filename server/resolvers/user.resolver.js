const convertErrors = require('../utils/convertErrors');

module.exports = {
  Query: {
    users: async (parent, args, { db }) => {
      const usersDb = await db.users.findAll();
      return usersDb.map(u => u.toJSON());
    }
  }
};
