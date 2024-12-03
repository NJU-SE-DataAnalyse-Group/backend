const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');


class User extends Model { }


User.init(

    {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        access_level: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0,
        },

    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user, options) => {

                const hashedEmail = await bcrypt.hash(user.email, 10);
                user.email = hashedEmail;
                const hashedPassword = await bcrypt.hash(user.password, 10);
                user.password = hashedPassword;

            },
            beforeUpdate: async (user, options) => {
                if (user.changed('email')) {
                    const hashedEmail = await bcrypt.hash(user.email, 10);
                    user.email = hashedEmail;
                }
                if (user.changed('password')) {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    user.password = hashedPassword;
                }
            }
        }
    }
);

(async () => {
    try {
        await sequelize.authenticate();


        await sequelize.sync();

        console.log('User model synced with the database.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();


module.exports = User;
