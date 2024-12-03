const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const csv = require('csv-parser');
const zlib = require('zlib');
class Cite extends Model { }

Cite.init(
    {
        paper_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cited_paper_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Cite',
        tableName: 'cites',
    }
);

const BATCH_SIZE = 1000;


const insertCitesFromCSV = async () => {
    let csvFilePath = './ml_model/dataset/edges.csv.gz';
    const citeCountInDb = await Cite.count();
    if (citeCountInDb > 0) {
        console.log('Cite table already has data, skipping insert.');
        return;
    }


    
    const cites = [];

    fs.createReadStream(csvFilePath)
        .pipe(zlib.createGunzip())
        .pipe(csv({ headers: false }))
        .on('data', (row) => {
            const paper_id = parseInt(row[0], 10);
            const cited_paper_id = parseInt(row[1], 10);


            if (!isNaN(paper_id) && !isNaN(cited_paper_id)) {
                cites.push({
                    paper_id,
                    cited_paper_id,
                });
            }
        })
        .on('end', async () => {

            await insertInBatches(cites);
        });
};

const insertInBatches = async (cites) => {
    const totalCites = cites.length;
    for (let i = 0; i < totalCites; i += BATCH_SIZE) {
        const batch = cites.slice(i, i + BATCH_SIZE);
        try {
            await Cite.bulkCreate(batch);
        } catch (error) {
            console.error('Error inserting batch:', error);
        }
    }
    console.log('All cites inserted successfully');
};


(async () => {
    try {
        await sequelize.authenticate(); 

        await sequelize.sync(); 

        insertCitesFromCSV().then(() => {
            console.log('Cite model synced with the database');
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
module.exports = Cite;