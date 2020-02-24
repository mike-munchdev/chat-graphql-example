/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'channelNotifications',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      notifiedByUserId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      notifiedUserId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      channelId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'channels',
          key: 'id'
        }
      },
      dateSent: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      notificationStatusId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'channelNotificationStatuses',
          key: 'id'
        }
      },
      notificationTypeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'channelNotificationTypes',
          key: 'id'
        }
      },
      linkId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
      },
      rejectedReason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      message: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    },
    {
      tableName: 'channelNotifications',
      timestamps: false
    }
  );
};
