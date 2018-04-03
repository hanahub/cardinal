const webpack = require('webpack');

module.exports = {
    entry: {
        app: [__dirname + '/public/src/app.jsx'],
        vendor: [
            'react', 'react-dom', 'react-router', 'react-bootstrap'
        ],
    },
    output: {
        path: __dirname + '/public/static',
        filename: 'app.bundle.js',
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' }),
    ],
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015'],
                },
            },
        ],
    },
    devServer: {
        port: 8000,
        contentBase: '/public/',
        proxy: {
            '**': {
                target: 'http://localhost:3000',
            },
        },
        historyApiFallback: true,
    },
    devtool: 'source-map',
};
