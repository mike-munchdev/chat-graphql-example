module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: 'Must be a valid email address'
          }
        }
      },
      userName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'users',
      dialect: 'mysql',
      timestamps: false
    }
  );
};
