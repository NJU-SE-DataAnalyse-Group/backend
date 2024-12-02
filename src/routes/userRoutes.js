const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 创建用户
router.post('/', userController.createUser);


// 用户登录
router.post('/login', userController.login);

// 获取用户信息 (通过用户 ID)
router.get('/:id', userController.getUser);

// 通过用户名获取用户
router.get('/name/:name', userController.getUserByName);

// 通过 email 获取用户
router.get('/email/:email', userController.getUserByEmail);

// 更新用户信息
router.put('/:id', userController.updateUser);

// 删除用户
router.delete('/:id', userController.deleteUser);

module.exports = router;
