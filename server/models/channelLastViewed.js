/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'channelLastViewed',
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
      lastViewedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      tableName: 'channelLastViewed',
      timestamps: false
    }
  );
};
