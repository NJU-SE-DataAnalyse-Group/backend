const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

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
    }
);

(async () => {
    try {
        await sequelize.authenticate(); // 测试连接
        console.log('Connection has been established successfully.');

        await sequelize.sync(); // 同步所有模型到数据库
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = User;
