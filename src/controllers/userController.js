const userServices = require('../services/userServices');

// 创建用户
async function createUser(req, res) {
    const { name, email, password,  access_level } = req.body;
    try {
        const newUser = await userServices.createUser({ name, email, password,  access_level });
            // console.log(newUser);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 用户登录
async function login(req, res) {
    const { name, email, password } = req.body;
    try {
        const user = await userServices.login(name, email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 获取用户
async function getUser(req, res) {
    const userId = req.params.id;
    try {
        const user = await userServices.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 通过用户名获取用户
async function getUserByName(req, res) {
    const name = req.params.name;
    try {
        const user = await userServices.getUserByName(name);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// 通过 email 获取用户
async function getUserByEmail(req, res) {
    const email = req.params.email;
    try {
        const user = await userServices.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 更新用户
async function updateUser(req, res) {
    const userId = req.params.id;
    const { name, email, password, access_level } = req.body;
    try {
        const user = await userServices.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await userServices.updateUser(userId, { name, email, password,  access_level });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 删除用户
async function deleteUser(req, res) {
    const userId = req.params.id;
    try {
        const user = await userServices.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await userServices.deleteUser(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createUser,
    login,
    getUser,
    getUserByName,
    getUserByEmail,
    updateUser,
    deleteUser,
};