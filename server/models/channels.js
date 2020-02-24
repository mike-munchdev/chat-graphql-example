/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'channels',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      channelTypeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'channelTypes',
          key: 'id'
        }
      },
      channelStatusId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'channelStatuses',
          key: 'id'
        }
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      lastModifiedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdById: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      lastModifiedById: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },

      lastMessageSnippet: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      unique_id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV1
      },
      friendlyName: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    },
    {
      tableName: 'channels',
      timestamps: false
    }
  );
};
