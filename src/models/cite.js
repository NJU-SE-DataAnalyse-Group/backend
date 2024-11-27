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
// 定义每批次插入的记录数
const BATCH_SIZE = 1000;

// 读取并解析 CSV 文件并分批次插入数据
const insertCitesFromCSV = async () => {
    // 不为空不插入
    let csvFilePath = './ml_model/dataset/edges.csv.gz';
    const citeCountInDb = await Cite.count();
    if (citeCountInDb > 0) {
        console.log('Cite table already has data, skipping insert.');
        return;
    }


    
    const cites = [];

    // 读取 CSV 文件
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
            // 现在我们分批次插入数据
            await insertInBatches(cites);
        });
};

// 按批次插入数据
const insertInBatches = async (cites) => {
    const totalCites = cites.length;
    for (let i = 0; i < totalCites; i += BATCH_SIZE) {
        const batch = cites.slice(i, i + BATCH_SIZE);
        try {
            // 批量插入数据
            await Cite.bulkCreate(batch);
            // console.log(`Inserted batch from ${i + 1} to ${Math.min(i + BATCH_SIZE, totalCites)}`);
        } catch (error) {
            console.error('Error inserting batch:', error);
            // 如果发生错误，可以根据需求选择是继续执行、回滚或做其他处理
        }
    }
    console.log('All cites inserted successfully');
};

// 执行插入操作
(async () => {
    try {
        await sequelize.authenticate(); // 测试连接

        await sequelize.sync(); // 同步模型

        // 插入所有数据
        insertCitesFromCSV().then(() => {
            console.log('Cite model synced with the database');
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
module.exports = Cite;