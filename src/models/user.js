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
                isEmail: true,  // 确保是有效的 email 格式
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0,
        },
        access_level: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0,
        },

    },
    {
        sequelize, // 传入 Sequelize 实例
        modelName: 'User', // 模型名称
        tableName: 'users', // 表名称
        timestamps: true, // 启用 createdAt 和 updatedAt 字段
        hooks: {
            beforeCreate: async (user, options) => {
                console.log(user.email);
                const hashedEmail = await bcrypt.hash(user.email, 10);  // 盐值轮数为10
                user.email = hashedEmail;  // 将加密后的密码赋值给 `email` 字段
                const hashedPassword = await bcrypt.hash(user.password, 10);  // 盐值轮数为10
                user.password = hashedPassword;  // 将加密后的密码赋值给 `password` 字段
    
            },
            beforeUpdate: async (user, options) => {
                if (user.changed('email')) {
                    const hashedEmail = await bcrypt.hash(user.email, 10); // 盐值轮数为10
                    user.email = hashedEmail; // 更新加密后的密码
                }
                if (user.changed('password')) {
                    const hashedPassword = await bcrypt.hash(user.password, 10); // 盐值轮数为10
                    user.password = hashedPassword; // 更新加密后的密码
                }
            }
        }
    }
);

(async () => {
    try {
        await sequelize.authenticate(); // 测试连接
        // console.log('Paper Connection has been established successfully.');

        await sequelize.sync(); // 同步所有模型到数据库
        //console.log('All models were synchronized successfully.');
        console.log('User model synced with the database.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();


module.exports = User;
