// this file was primarily set up to help with testing purposes - we do NOT want listen called

const express = require('express');
require('./db/mongoose');
require('dotenv').config()
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

// automatically parse incoming JSON to an object, access in req handler
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
