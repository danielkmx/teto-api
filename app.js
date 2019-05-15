const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const surveyRoutes = require('./api/routes/surveys');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/surveys', surveyRoutes);


app.use((req,res,next) => {
    const error = new Error('Not found');

    error.status = 404;
    next(error);
});

app.use((error,req,res,next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
});

module.exports = app;