const express = require('express');
const identifyRoutes = require('./routes/identify');
const { errorHandler } = require('./middleware/errorHandler');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(identifyRoutes);
app.use(errorHandler);

module.exports = app;
