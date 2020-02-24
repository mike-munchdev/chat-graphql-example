'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const db = {};
const pool = {
  max: 5,
  min: 0,
  idle: 20000,
  acquire: 20000
};

console.log('attempting to connect to:', process.env.host);

const sequelize = new Sequelize(
  process.env.database,
  process.env.username,
  process.env.password,
  {
    host: process.env.host,
    dialect: 'mysql',
    logging: false,
    pool,
    dialectOptions: {
      dateStrings: true
    }
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

fs.readdirSync(__dirname)
  .filter(
    file =>
      file.indexOf('.') !== 0 &&
      !file.includes('index') &&
      file.slice(-3) === '.js'
  )
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const User = db.users;

const Channel = db.channels;
const ChannelType = db.channelTypes;
const ChannelStatus = db.channelStatuses;
const ChannelMember = db.channelMembers;
const ChannelNotification = db.channelNotifications;
const ChannelMessage = db.channelMessages;
const ChannelMessageStatus = db.channelMessageStatuses;
const ChannelNotificationStatus = db.channelNotificationStatuses;
const ChannelNotificationTypes = db.channelNotificationTypes;
const ChannelLastViewed = db.channelLastViewed;

// Users  Setup
////

User.hasMany(ChannelNotification, {
  as: 'invitationsFrom',
  foreignKey: 'notifiedByUserId'
});

User.hasMany(ChannelNotification, {
  as: 'invitationsTo',
  foreignKey: 'notifiedUserId'
});

// Channel

Channel.belongsTo(ChannelType, {
  as: 'channelType',
  foreignKey: 'channelTypeId'
});
Channel.belongsTo(ChannelStatus, {
  as: 'channelStatus',
  foreignKey: 'channelStatusId'
});

Channel.belongsTo(User, {
  as: 'createdBy',
  foreignKey: 'createdById'
});
Channel.belongsTo(User, {
  as: 'lastModifiedBy',
  foreignKey: 'lastModifiedById'
});
Channel.hasMany(ChannelMessage, {
  as: 'messages',
  foreignKey: 'channelId'
});

ChannelMessage.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});

ChannelMessage.belongsTo(ChannelMessageStatus, {
  as: 'messageStatus',
  foreignKey: 'channelMessageStatusId'
});

Channel.hasMany(ChannelNotification, {
  as: 'invitations',
  foreignKey: 'channelId'
});

Channel.hasMany(ChannelMember, {
  as: 'members',
  foreignKey: 'channelId'
});

ChannelMember.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});

ChannelNotification.belongsTo(Channel, {
  as: 'channel',
  foreignKey: 'channelId'
});

ChannelNotification.belongsTo(User, {
  as: 'notifiedBy',
  foreignKey: 'notifiedByUserId'
});

ChannelNotification.belongsTo(User, {
  as: 'notified',
  foreignKey: 'notifiedUserId'
});

ChannelNotification.belongsTo(ChannelNotificationStatus, {
  as: 'status',
  foreignKey: 'notificationStatusId'
});

ChannelNotification.belongsTo(ChannelNotificationTypes, {
  as: 'type',
  foreignKey: 'notificationTypeId'
});
Channel.hasMany(ChannelLastViewed, {
  as: 'lastViews',
  foreignKey: 'channelId'
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
