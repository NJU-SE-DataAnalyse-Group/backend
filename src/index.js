const express = require('express');
const app = express();

// 引入路由模块
const userRoutes = require('./routes/userRoutes');

// 使用中间件解析 JSON 请求体
app.use(express.json());


// 挂载用户路由到 `/users`
app.use('/user', userRoutes);

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
