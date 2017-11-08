import path from 'path';
import webpack from 'webpack';
import webpackRules from './webpackRules';

const config = {
    entry: path.resolve(__dirname, '../src/index.js'),

    output: {
        path: path.resolve(__dirname, '../dist/assets'),
        filename: 'index.js',
        publicPath: '/assets',
    },

    devServer: {
        inline: true,
        port: 8081,
        contentBase: path.resolve(__dirname, '../src'),
    },

    devtool: 'cheap-module-inline-source-map',

    module: {
        rules: [
            webpackRules.babelLoaderRule,
            webpackRules.cssLoaderRule,
            webpackRules.fontLoaderRule,
            webpackRules.eslintLoaderRule,
            webpackRules.fileLoaderRule,
        ],
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"dev"',
            },
        }),
    ],
};

export default config;
