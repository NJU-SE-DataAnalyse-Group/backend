const Paper = require('../models/paper');
const Cite = require('../models/cite');
const axios = require('axios');
const paperServices = {

    async getPaperById(paperId) {
        try {
            const paper = await Paper.findOne({
                where: {
                    paper_id: paperId  // 这里替换为你要查询的 paper_id 值
                }
            });
            return paper;
        } catch (error) {
            throw new Error(`Failed to find paper by ID: ${error.message}`);
        }
    },

    async getPaperByTitle(title) {
        try {
            const paper = await Paper.findOne({ where: { title } });
            return paper;
        } catch (error) {
            throw new Error(`Failed to find paper by title: ${error.message}`);
        }
    },
    // Search function
    async search(keyword) {
        try {
            const response = await axios.post('http://localhost:5000/search', { keyword });
            const similarPapers = response.data;
            console.log(similarPapers);
            return similarPapers;
        } catch (error) {
            console.error("Error during search:", error);
            return [];
        }
    },
    async getListOfPapersByCategory(category) {
        try {
            // 查询指定类别下的所有论文标题
            const papers = await Paper.findAll({
                where: {
                    category
                },
                attributes: ['title']  // 只选择 title 字段
            });
            
            // 返回论文标题数组
            return papers.map(paper => paper.title);
        } catch (error) {
            throw new Error(`Failed to find papers by category: ${error.message}`);
        }
    },
    async getListOfSimilarPapers(paperId) {
        try {

            const paper = await Paper.findOne({
                where: {
                    paper_id: paperId
                }
            });

            const response = await axios.get(`http://localhost:5001/get_similar_papers?index=${paperId}`, {
            });

            const similarPapers = response.data;
            return similarPapers;
        } catch (error) {
            throw new Error(`Failed to find similar papers: ${error.message}`);
        }
    },
    // 获取引用该论文的所有论文
    async getListsOfCiters(paperId) {
        try {
            const cites = await Cite.findAll({
                where: {
                    cited_paper_id: paperId
                }
            });
            return cites;
        } catch (error) {
            throw new Error(`Failed to find cites for paper: ${error.message}`);
        }
    },

    // 获取该论文引用的所有论文
    async getListsOfCitees(paperId) {
        try {
            const cites = await Cite.findAll({
                where: {
                    paper_id: paperId
                }
            });
            return cites;
        } catch (error) {
            throw new Error(`Failed to find cited papers for paper: ${error.message}`);
        }
    }
};


module.exports = paperServices;
