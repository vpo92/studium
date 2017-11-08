const fileLoaderRule = {
  test: /\.(png|svg|jpg|gif)$/,
  use: [
    'file-loader',
  ],
}

const babelLoaderRule = {
    test: /\.jsx?$/,
    exclude: [/node_modules/],
    use: [{
        loader: 'babel-loader',
    }],
};

const cssLoaderRule = {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
};

const fontLoaderRule = {
    test: /\.(ttf|woff|woff(2))$/,
    loader: 'file-loader',
    options: {
        name: 'fonts/[path][name].[ext]',
    },
};

const eslintLoaderRule = {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'eslint-loader',
    options: {
        // eslint options (if necessary)
    },
};

export default {
    babelLoaderRule,
    cssLoaderRule,
    fontLoaderRule,
    eslintLoaderRule,
    fileLoaderRule,
};
