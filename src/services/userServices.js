const User = require('../models/user'); // 引入 User 模型
const bcrypt = require('bcryptjs'); // 引入 bcryptjs 库
const userServices = {
    /**
     * 创建新用户
     * @param {Object} userData 用户数据 { name, email, password, premium }
     * @returns {Promise<Object>} 返回创建的用户对象
     */
    async createUser(userData) {
        try {
            // console.log(userData);
            const user = await User.create(userData);
            return user;
        } catch (error) {
            // console.log(error);
            throw new Error(`Failed to create user: ${error.message}`);
        }
    },

    /**
     * 用户登录
     * @param {string} name 用户名
     * @param {string} email 用户 email
     * @param {string} password 用户密码
     * @returns {Promise<Object|null>} 返回用户对象或 null
     */
    async login(name, email, password) {
        try {
            const user = await User.findOne({ where: { name } });
            // 等待 bcrypt.compare 完成，并且两个比较操作都成功才算匹配
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            const isEmailMatch = await bcrypt.compare(email, user.email);

            if (isPasswordMatch && isEmailMatch) {
                return user;
            } else {
                console.log("Invalid password or email");
                return null;
            }
        } catch (error) {
            throw new Error(`Failed to login: ${error.message}`);
        }
    },


    /**
     * 根据 ID 查找用户
     * @param {number} userId 用户 ID
     * @returns {Promise<Object|null>} 返回用户对象或 null
     */
    async getUserById(userId) {
        try {
            const user = await User.findByPk(userId);
            return user;
        } catch (error) {
            throw new Error(`Failed to find user by ID: ${error.message}`);
        }
    },

    /**
     * 根据用户名查找用户
     * @param {string} name 用户名
     * @returns {Promise<Object|null>} 返回用户对象或 null
     */
    async getUserByName(name) {
        try {
            const user = await User.findOne({ where: { name } });
            return user;
        } catch (error) {
            throw new Error(`Failed to find user by name: ${error.message}`);
        }
    },


    /**
     * 根据 email 查找用户
     * @param {string} email 用户 email
     * @returns {Promise<Object|null>} 返回用户对象或 null
     */
    async getUserByEmail(email) {
        try {
            const user = await User.findOne({ where: { email } });
            return user;
        } catch (error) {
            throw new Error(`Failed to find user by email: ${error.message}`);
        }
    },

    /**
     * 更新用户信息
     * @param {number} userId 用户 ID
     * @param {Object} updateData 要更新的数据
     * @returns {Promise<Object>} 返回更新后的用户对象
     */
    async updateUser(userId, updateData) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // 过滤掉 updateData 中值为 null 的字段
            const filteredData = Object.fromEntries(
                Object.entries(updateData).filter(([key, value]) => value !== null)
            );

            const updatedUser = await user.update(filteredData);
            return updatedUser;
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    },

    /**
     * 删除用户
     * @param {number} userId 用户 ID
     * @returns {Promise<void>} 无返回值
     */
    async deleteUser(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            await user.destroy();
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    },
};

module.exports = userServices;
