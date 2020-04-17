const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    devServer: {
        proxy: {
            "^/ws": {
                target: "http://localhost:8000",
                ws: true,
                secure: false
            }
        }
    },
    chainWebpack(config) {
        config.plugin('CompressionPlugin').use(CompressionPlugin);
    }
};
