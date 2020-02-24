/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'channelNotificationTypes',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: 'channelNotificationTypes',
      timestamps: false
    }
  );
};
