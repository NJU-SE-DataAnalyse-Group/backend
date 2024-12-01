const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');

// 搜索论文
router.get('/search', paperController.search);

// 通过类别获取论文
router.get('/category/:category', paperController.getListOfPapersByCategory);

// 通过 ID 获取论文
router.get('/:id', paperController.getPaperById);

// 通过标题获取论文
router.get('/', paperController.getPaperByTitle);


// 获取相似论文
router.get('/:id/similar', paperController.getListOfSimilarPapers);

// 获取引用该论文的所有论文
router.get('/:id/citers', paperController.getListsOfCiters);

// 获取该论文引用的所有论文
router.get('/:id/citees', paperController.getListsOfCitees);



module.exports = router;