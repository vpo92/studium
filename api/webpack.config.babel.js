import path from 'path';
import nodeExternals from 'webpack-node-externals';

const config = {
  entry: {
    server: './src/server.js',
    worker: './src/worker.js',
  },

  target: 'node',
  externals: [nodeExternals({ modulesDir: './node_modules' })],

  output: {
    path: path.resolve(__dirname, './docker/build'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
              plugins: ['babel-plugin-transform-object-rest-spread'],
            },
          },
        ],
      },
    ],
  },
};

module.exports = config;
