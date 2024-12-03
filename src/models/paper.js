const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const csv = require('csv-parser');
const zlib = require('zlib');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const MAX_ABSTRACT_LENGTH = 65535;


const BATCH_SIZE = 10000;


class Paper extends Model { }

Paper.init(
    {
        paper_id: {
            type: DataTypes.INTEGER,
            unique: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        abstract: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Paper',
        tableName: 'papers',
    }
);


const insertPapersFromCSV = async () => {
    const papers = [];
    let cur_id = 0;
    const rest_ids = [];

    const paperCountInDb = await Paper.count();
    if (paperCountInDb > 0) {
        console.log('Paper table already has data, skipping insert.');
    } else {
        fs.createReadStream('./ml_model/dataset/papers.csv.gz')
            .pipe(zlib.createGunzip())
            .pipe(csv())
            .on('data', (row) => {
                const { title, abstract, category, year } = row;
                if (year < 2019) {
                    if (abstract.length > MAX_ABSTRACT_LENGTH) {
                        console.warn(`Abstract for paper "${title}" is too long, truncating...`);
                        row.abstract = abstract.slice(0, MAX_ABSTRACT_LENGTH);
                    }

                    papers.push({
                        paper_id: cur_id++,
                        title,
                        abstract: row.abstract,
                        category,
                        year: parseInt(year),
                    });

                    if (papers.length >= BATCH_SIZE) {
                        Paper.bulkCreate(papers, { validate: true })
                            .then(() => {
                            })
                            .catch((error) => {
                                console.error('Error inserting papers:', error);
                            });

                        papers.length = 0;
                    }
                } else {
                    rest_ids.push(cur_id++);
                }
            })
            .on('end', async () => {
                if (papers.length > 0) {
                    try {
                        await Paper.bulkCreate(papers, { validate: true });
                        papers.length = 0;
                    } catch (error) {
                        console.error('Error inserting remaining papers:', error);
                    }
                }
            })
            .on('error', (err) => {
                console.error('Error reading CSV file:', err);
            });

    }

    let tot_count = 0;
    if (!fs.existsSync('./ml_model/dataset/test_papers_predictions.csv')) {
        console.log('Predicting categories for test papers...');
        execPromise('python3 -u ml_model/predict.py').then(() => {
            console.log('Prediction complete.');
            fs.createReadStream('./ml_model/dataset/test_papers_predictions.csv')
                .pipe(csv())
                .on('data', (row) => {
                    const { title, abstract, category, year } = row;

                    if (abstract.length > MAX_ABSTRACT_LENGTH) {
                        console.warn(`Abstract for paper "${title}" is too long, truncating...`);
                        row.abstract = abstract.slice(0, MAX_ABSTRACT_LENGTH);
                    }
                    let id = rest_ids.shift();

                    papers.push({
                        paper_id: id,
                        title,
                        abstract: row.abstract,
                        category,
                        year: parseInt(year),
                    });


                    if (papers.length >= BATCH_SIZE) {
                        Paper.bulkCreate(papers, { validate: true })
                            .then(() => {

                            })
                            .catch((error) => {
                                console.error('Error inserting papers:', error);
                            });
                        tot_count += papers.length;
                        papers.length = 0;

                    }

                })
                .on('end', async () => {

                    if (papers.length > 0) {
                        try {
                            tot_count += papers.length;
                            await Paper.bulkCreate(papers, { validate: true });

                        } catch (error) {
                            console.error('Error inserting remaining papers:', error);
                        }
                    }
                    console.log('All papers inserted successfully');
                })
                .on('error', (err) => {
                    console.error('Error reading CSV file:', err);
                });
        }
        );
    }

};


(async () => {
    try {
        await sequelize.authenticate();

        await sequelize.sync();


        insertPapersFromCSV().then(() => {
            console.log('Paper model synced with the database');
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = Paper;