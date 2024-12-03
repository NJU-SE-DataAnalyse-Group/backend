const express = require('express');
const cors = require('cors');
const app = express();
const Paper = require('./models/paper');

// 引入路由模块
const userRoutes = require('./routes/userRoutes');

const paperRoutes = require('./routes/paperRoutes');


app.use(cors({
    origin: 'http://localhost:8080', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
}));


app.use(express.json());


// 挂载用户路由到 `/user`
app.use('/user', userRoutes);

// 挂载论文路由到 `/paper`
app.use('/paper', paperRoutes);


app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found' });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
