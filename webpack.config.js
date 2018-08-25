const ENVIRONMENT = process.env.NODE_ENV;
const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const { ENV } = require('./constants');

const postCSSLoader = {
  loader: 'postcss-loader',
  options: {
    sourceMap: true,
    plugins() {
      return [
        autoprefixer({
          browsers: ['last 3 versions']
        })
      ];
    }
  }
};

const config = {
  devtool: 'source-map',

  stats: {
    colors: true,
    reasons: true
  },

  entry: {
    bundle: [`${__dirname}/src/public/js/index.js`]
  },

  target: 'web',

  output: {
    libraryTarget: 'var',
    path: `${__dirname}/src/public/dist/`,
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: '/dist/'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(ENVIRONMENT)
      }
    }),
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  resolve: {
    modules: ['node_modules', 'src/public'],
    extensions: ['.js', '.js'],
    alias: {
      img: path.resolve(__dirname, './src/public/images')
    }
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: { minimize: true, importLoaders: 1 }
          },
          postCSSLoader,
          {
            loader: 'sass-loader',
            options: {
              includePaths: [path.resolve(__dirname, './node_modules/compass-mixins/lib')],
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.js$/, exclude: /node_modules/, loader: ['babel-loader']
      },
      { test: /\.json$/, exclude: /node_modules/, loader: 'json' },
      {
        test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader?limit=100000'
      }
    ]
  }
};

if (ENVIRONMENT === ENV.DEVELOPMENT) {
  // add modules for hot reloading
  config.entry.bundle.unshift('webpack-hot-middleware/client');
  config.entry.bundle.unshift('webpack/hot/dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
  /**
  * PRODUCTION!
  */

  const options = {
    sourceMap: true,
    comments: false,
    minimize: true,
    compress: {
      drop_console: true
    }
  };

  // minify JS
  config.plugins.push(new webpack.optimize.UglifyJsPlugin(options));
}

module.exports = config;
