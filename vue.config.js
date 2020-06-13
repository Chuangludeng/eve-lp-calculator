module.exports = {
    configureWebpack: {
      devtool: 'source-map'
    },

    devServer: {
        open: true,
        host: "127.0.0.1",
        port: "8080",
      // 代理
        proxy: {
            "/api/*": {
                target: "https://www.ceve-market.org",
                changeOrigin: true,
                pathRewrite: {
                }
            }


        }
    }

  }