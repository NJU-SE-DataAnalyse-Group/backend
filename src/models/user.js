const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init(
    {
        name: {
            type: DataTypes.STRING,
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
    },
    {
        sequelize, // 传入 Sequelize 实例
        modelName: 'User', // 模型名称
        tableName: 'users', // 表名称
        timestamps: true, // 启用 createdAt 和 updatedAt 字段
    }
);

module.exports = User;
