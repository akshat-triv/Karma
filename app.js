const express = require('express');
const morgan = require('morgan');
const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.end('This is the home page, Hello World!');
});

app.get('*', (req, res) => {
  res.end('Page not found');
});

module.exports = app;
