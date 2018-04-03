module.exports = function (app, models) {

    const bcrypt = require("bcrypt-nodejs");
    const regression = require("regression");

    const access_denied = "Access denied. ";

    app.get('/api/analysis/linear_regression', linearRegression);
    app.get('/api/analysis/stats', stats);


    function linearRegression(req, res) {
        let dataset = req.query['dataset'];
        let y = req.query['y'];
        let X = req.query['X'];

        let base = (new Date("2017-01-01")).getTime();

        let trainingData = dataset.map(d => {return [(new Date(d.slice(9, 20))).getTime() / base, parseFloat(d.slice(28, -2))]});

        const result = regression.linear(trainingData);
        const gradient = result.equation[0];
        const intercept = result.equation[1];

        if (gradient && intercept) {
            return res.json({status: true, gradient: gradient, intercept: intercept, base: base}).status(200);
        } else {
            return res.json({status: false, message: 'empty data set for regression. '}).status(400);
        }

    }

    function getMean(data) {

        let sum = data.reduce(function(sum, value){
            return sum + value;
        }, 0);


        return sum / data.length;
    }

    function getStd(data) {
        let avg = getMean(data);

        let squareDiffs = data.map(function(value){
            let diff = value - avg;

            return diff * diff;
        });

        let avgSquareDiff = getMean(squareDiffs);

        return Math.sqrt(avgSquareDiff);
    }

    function stats(req, res) {
        let dataset = req.query['data'];
        let trainingData = dataset.map(d => {return parseFloat(d.slice(9, -2))});

        if (trainingData.length > 0 && trainingData[0]) {

            let mean = getMean(trainingData).toFixed(2);
            let std = getStd(trainingData).toFixed(2);

            return res.json({status: true, stats: {mean: mean, std: std, min: Math.min.apply(null, trainingData), max: Math.max.apply(null, trainingData)}}).status(200);
        } else {
            return res.json({status: false, message: "empty data for statistics computation. ", stats: {mean: null, std: null, min: null, max: null}}).status(400);
        }




    }




};