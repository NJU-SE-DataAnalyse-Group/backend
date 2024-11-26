const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const csv = require('csv-parser');
const zlib = require('zlib');

// 设置 TEXT 字段的最大长度限制
const MAX_ABSTRACT_LENGTH = 65535;  // MySQL TEXT 字段的最大长度

// 每批插入的大小
const BATCH_SIZE = 10000;  // 每次插入 1000 条记录

// 模型定义
class Paper extends Model {}

Paper.init(
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        abstract: {
            type: DataTypes.TEXT,  // 使用 TEXT 类型
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

// 插入数据函数
const insertPapersFromCSV = async () => {
    const papers = [];

    // 查询表中的记录数，判断是否为空
    const paperCountInDb = await Paper.count();
    if (paperCountInDb > 0) {
        console.log('Paper table already has data, skipping insert.');
        return; // 如果表中已有数据，跳过插入
    }

    fs.createReadStream('./ml_model/dataset/papers.csv.gz')
        .pipe(zlib.createGunzip())
        .pipe(csv())
        .on('data', (row) => {
            const { title, abstract, category, year } = row;

            // 检查 abstract 字段长度，确保它不会超出数据库字段限制
            if (abstract.length > MAX_ABSTRACT_LENGTH) {
                console.warn(`Abstract for paper "${title}" is too long, truncating...`);
                row.abstract = abstract.slice(0, MAX_ABSTRACT_LENGTH);  // 截断超长的文本
            }

            papers.push({
                title,
                abstract: row.abstract,  // 确保已截断的文本被使用
                category,
                year: parseInt(year),
            });

            // 每当数组长度达到批量大小时，插入一次数据
            if (papers.length >= BATCH_SIZE) {
                Paper.bulkCreate(papers, { validate: true })
                    .then(() => {
                        //console.log(`Inserted ${papers.length} papers successfully.`);
                    })
                    .catch((error) => {
                        console.error('Error inserting papers:', error);
                    });

                papers.length = 0;  // 清空当前数组，准备下次插入
            }
        })
        .on('end', async () => {
            // 插入剩余的数据（如果有）
            if (papers.length > 0) {
                try {
                    await Paper.bulkCreate(papers, { validate: true });
                    //console.log('Remaining papers inserted successfully');
                } catch (error) {
                    console.error('Error inserting remaining papers:', error);
                }
            }
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
        });
};

// 执行插入操作
(async () => {
    try {
        await sequelize.authenticate(); // 测试连接

        await sequelize.sync(); // 同步模型

        // 插入所有数据
        insertPapersFromCSV().then(() => {
            console.log('Paper model synced with the database');
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
