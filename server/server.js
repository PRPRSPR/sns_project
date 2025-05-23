require('dotenv').config();

const express = require('express')
const cors = require('cors')
const path = require('path');

const userRouter = require('./routes/user')
const diariesRouter = require('./routes/diaries')
const commentsRouter = require('./routes/comments')
const mediaRouter = require('./routes/media')
const friendsRouter = require('./routes/friends')
const notifyRouter = require('./routes/notify')
const messagesRouter = require('./routes/messages')

const app = express()
app.use(express.json({ limit: '30mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/messages', express.static('uploads/messages'));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors({
    origin : ["http://localhost:3000","http://localhost:3001"],
    credentials : true
}));

app.use("/user", userRouter);
app.use("/diary", diariesRouter);
app.use("/comments", commentsRouter);
app.use("/media", mediaRouter);
app.use("/friends", friendsRouter);
app.use("/notify", notifyRouter);
app.use("/messages", messagesRouter);

// const PORT = 3005;
const PORT = process.env.PORT || 3005;
app.listen(PORT, ()=>{
    console.log(`서버 실행 중 - port : ${PORT}`);
})