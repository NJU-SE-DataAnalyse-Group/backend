const mysql = require('mysql2');

// 创建数据库连接
const connection = mysql.createConnection({
    host: 'localhost',       // 数据库地址
    user: 'root',            // 数据库用户名
    password: '123456', // 数据库密码
    database: 'test_db',     // 要连接的数据库名称
});

// 测试连接
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});
