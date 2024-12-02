const express = require('express');
const cors = require('cors');
const app = express();
const Paper = require('./models/paper');

// 引入路由模块
const userRoutes = require('./routes/userRoutes');

const paperRoutes = require('./routes/paperRoutes');


app.use(cors({
    origin: 'http://localhost:8080', // 允许的前端地址
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的 HTTP 方法
    credentials: true // 如果前端需要带 cookies
}));

// 使用中间件解析 JSON 请求体
app.use(express.json());


// 挂载用户路由到 `/user`
app.use('/user', userRoutes);

// 挂载论文路由到 `/paper`
app.use('/paper', paperRoutes);

// 处理未知路由
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found' });
});

// 通用错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
