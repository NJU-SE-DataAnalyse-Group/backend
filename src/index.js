const sequelize = require('./config/database');
const User = require('./models/user');

(async () => {
    try {
        await sequelize.sync({ force: true }); // 强制重建表，仅用于开发阶段
        console.log('Database synced successfully.');

        // 测试插入数据
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: '123456',
        });
        console.log(user.toJSON());
    } catch (error) {
        console.error('Error syncing database:', error);
    }
})();
