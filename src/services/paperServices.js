const Paper = require('../models/paper');
const Cite = require('../models/cite');
const axios = require('axios');
const paperServices = {

    async getPaperById(paperId) {
        try {
            const paper = await Paper.findOne({
                where: {
                    paper_id: paperId  
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

    async search(keyword) {
        try {
            const response = await axios.post('http://localhost:5000/search', { keyword });
            return response.data;
        } catch (error) {
            console.error("Error during search:", error);
            return [];
        }
    },
    async getListOfPapersByCategory(category) {


        const papers = await Paper.findAll({

            where: {
                category
            },
            limit: 10  

        });



        return papers;
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
