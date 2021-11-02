const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require('path');

const userRouter = require(path.join(__dirname, 'routes/userRouter.js'));

app.use(express.json());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/v1/users', userRouter);

app.get('*', (req, res) => {
  res.end('Page not found');
});

module.exports = app;
