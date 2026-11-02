import path from 'path';
import nodeExternals from 'webpack-node-externals';

const config = {
  entry: './src/server.js',

  target: 'node',
  externals: [nodeExternals({ modulesDir: './node_modules' })],

  output: {
    path: path.resolve(__dirname, './docker/build'),
    filename: 'server.js',
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
