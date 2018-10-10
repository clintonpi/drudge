const express = require('express');
const compiler = require('webpack');
const path = require('path');
const webpackDevMiddleWare = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config');
const { ENV } = require('../constants');

const app = express();
const ENVIRONMENT = process.env.NODE_ENV || ENV.PRODUCTION;

app.use(express.static(path.join(__dirname, '..', 'public', 'dist')));

if (ENVIRONMENT === ENV.DEVELOPMENT) {
  // Attach webpack dev server to running app
  ((serverInstance) => {
    const options = {
      historyApiFallback: true,
      hot: true,
      noInfo: true,
      publicPath: config.output.publicPath
    };
    const compilerConfig = compiler(config);
    serverInstance.use(webpackDevMiddleWare(compilerConfig, options));
    serverInstance.use(webpackHotMiddleware(compilerConfig));
  })(app);
}

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '..', 'public', 'dist', 'index.html'));
});

app.get('/signup', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '..', 'public', 'dist', 'html', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '..', 'public', 'dist', 'html', 'login.html'));
});

app.listen(4000);

module.exports = app;
