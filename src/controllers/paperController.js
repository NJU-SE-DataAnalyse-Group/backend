const paperServices = require('../services/paperServices');

const paperController = {
    async getPaperById(req, res, next) {
        try {
            const paperId = req.params.id;
            const paper = await paperServices.getPaperById(paperId);
            res.json(paper);
        } catch (error) {
            next(error);
        }
    },
    
    async getPaperByTitle(req, res, next) {
        try {
            const title = req.query.title;
            const paper = await paperServices.getPaperByTitle(title);
            res.json(paper);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = paperController;