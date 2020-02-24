/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'channelMembers',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      channelId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'channels',
          key: 'id'
        }
      },
      dateJoined: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      dateLeft: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'channelMembers',
      timestamps: false
    }
  );
};
