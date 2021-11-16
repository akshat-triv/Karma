const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

const userRouter = require(path.join(__dirname, 'routes/userRouter.js'));
const projectRouter = require(path.join(__dirname, 'routes/projectRouter.js'));
const notificationRouter = require(path.join(
  __dirname,
  'routes/notificationRouter.js'
));

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/notifications', notificationRouter);

app.get('*', (req, res) => {
  res.end('Page not found');
});

module.exports = app;
