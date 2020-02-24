const get = require('lodash/get');
const jwt = require('jsonwebtoken');
const db = require('../models/index');

const validateToken = token => {
  return new Promise((resolve, reject) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      resolve(decoded);
    } catch (e) {
      reject(e);
    }
  });
};

const findUser = decoded => {
  return new Promise(async (resolve, reject) => {
    try {
      if (decoded.id) {
        const user = await db.users.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        const roles = await db.user_roles.findAll({
          where: { user_id: user.id },
          include: [
            {
              association: 'role',
              attributes: ['slug', 'id', 'is_primary']
            }
          ]
        });

        const accounts = await db.user_accounts.findAll({
          where: { user_id: user.id }
        });

        resolve({
          ...user.toJSON(),
          accounts: accounts.map(a => a.toJSON()),
          roles: roles.map(r => r.toJSON())
        });
      } else {
        throw new Error('Malformed token');
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = { validateToken, findUser };
