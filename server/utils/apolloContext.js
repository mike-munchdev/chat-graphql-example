const { ForbiddenError } = require('apollo-server-express');
const { validateToken, findUser } = require('./tokens');
const db = require('../models/index');

module.exports = async args => {
  try {
    let user;

    if (args.req) {
      // console.log("http request");

      const req = args.req;
      const token = req.header('x-auth');
      if (!token) throw new ForbiddenError('missing token');
      const clientVersion = req.header('version');
      const decoded = await validateToken(token);

      user = await findUser(decoded);

      if (!user) {
        const ip =
          req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress ||
          req.ips;
        const errorMessage = `#badtoken User with token ${token} not found. IP: ${ip}, version: ${clientVersion}`;

        throw new ForbiddenError(errorMessage);
      }
    } else if (args.connection) {
      // console.log("web socket request");

      user = args.connection.context.currentUser;
    }
    return { db, user };
  } catch (e) {
    throw e;
  }
};
