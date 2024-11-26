const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');

// 通过 ID 获取论文
router.get('/:id', paperController.getPaperById);

// 通过标题获取论文
router.get('/', paperController.getPaperByTitle);

module.exports = router;