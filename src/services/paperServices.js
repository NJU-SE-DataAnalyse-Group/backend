const Paper = require('../models/paper');

const paperServices = {

    async getPaperById(paperId) {
        try {
            const paper = await Paper.findByPk(paperId);
            return paper;
        } catch (error) {
            throw new Error(`Failed to find paper by ID: ${error.message}`);
        }
    },

    async getPaperByTile(title) {
        try {
            const paper = await Paper.findOne({ where: { title } });
            return paper;
        } catch (error) {
            throw new Error(`Failed to find paper by title: ${error.message}`);
        }
    }
};

module.exports = paperServices;