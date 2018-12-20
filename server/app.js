const express = require('express');
const bodyParser = require('body-parser');
const compiler = require('webpack');
const path = require('path');
const webpackDevMiddleWare = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config');
const { ENV } = require('../constants');
const userRouter = require('./users/userRoute');
const todoRouter = require('./todos/todoRoute');

const app = express();
const ENVIRONMENT = process.env.NODE_ENV || ENV.PRODUCTION;

app.use(express.static(path.join(__dirname, '..', 'public', 'dist')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(userRouter);
app.use(todoRouter);

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

app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', 'dist', 'html', '404.html'));
});

app.listen(4000);

module.exports = app;
