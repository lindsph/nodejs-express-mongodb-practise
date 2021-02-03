const express = require('express');
require('./db/mongoose');
require('dotenv').config()
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

console.log(process.env.MONGODB_URL)

const app = express();
const PORT = process.env.PORT;

// automatically parse incoming JSON to an object, access in req handler
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
});
