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
    },
    async search(req, res, next) {
        try {
            const keyword = req.query.keyword;
            const papers = await paperServices.search(keyword);
            res.json(papers);
        } catch (error) {
            next(error);
        }
    },
    async getListOfPapersByCategory(req, res, next) {
        try {
            const category = req.params.category;
            const papers = await paperServices.getListOfPapersByCategory(category);
            res.json(papers);
        } catch (error) {
            next(error);
        }
    },
    async getListOfSimilarPapers(req, res, next) {
        try {
            const paperId = req.params.id;
            const papers = await paperServices.getListOfSimilarPapers(paperId);
            res.json(papers);
        } catch (error) {
            next(error);
        }
    },
    async getListsOfCiters(req, res, next) {
        try {
            const paperId = req.params.id;
            const cites = await paperServices.getListsOfCiters(paperId);
            res.json(cites);
        } catch (error) {
            next(error);
        }
    },
    async getListsOfCitees(req, res, next) {
        try {
            const paperId = req.params.id;
            const cites = await paperServices.getListsOfCitees(paperId);
            res.json(cites);
        } catch (error) {
            next(error);
        }
    },

};

module.exports = paperController;
