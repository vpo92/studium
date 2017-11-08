import webpackDev from './Webpack/webpack.dev';
import webpackProd from './Webpack/webpack.prod';

const initWebpack = (env) => {
    if (env === 'prod') {
        return webpackProd;
    }
    return webpackDev;
};

export default initWebpack;
