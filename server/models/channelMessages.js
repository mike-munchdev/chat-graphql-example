/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'channelMessages',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      userId: {
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
      channelMessageStatusId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'channelMessageStatuses',
          key: 'id'
        }
      }
    },
    {
      tableName: 'channelMessages',
      timestamps: false
    }
  );
};
