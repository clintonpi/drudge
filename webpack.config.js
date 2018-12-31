const ENVIRONMENT = process.env.NODE_ENV;
const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const { ImageminWebpackPlugin } = require('imagemin-webpack');
const imageminPngQuant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');
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

const htmlLoader = (folder = false) => {
  const fileLoader = folder === false ? 'file-loader?name=[name].[ext]' : 'file-loader?name=html/[name].[ext]';
  return [
    fileLoader,
    'extract-loader',
    {
      loader: 'html-loader',
      options: {
        minimize: true,
        removeAttributeQuotes: false,
        collapseWhitespace: true,
        conservativeCollapse: false
      }
    }
  ];
};

const config = {
  devtool: 'source-map',

  stats: {
    colors: true,
    reasons: true
  },

  entry: {
    bundle: [`${__dirname}/public/src/js/index.js`],
    modal: [`${__dirname}/public/src/js/modal.js`]
  },

  target: 'web',

  output: {
    libraryTarget: 'var',
    path: `${__dirname}/public/dist/`,
    filename: 'js/[name].js',
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
    new webpack.NoEmitOnErrorsPlugin(),
    new WriteFilePlugin(), // using this because express.static was not getting the files in memory
    new CopyWebpackPlugin([
      { from: 'public/src/images/favicon.ico', to: 'images/favicon.ico' }
    ]),
    new ExtractTextPlugin({
      filename: 'css/[name].css'
    })
  ],

  resolve: {
    modules: ['node_modules', 'public'],
    extensions: ['.js', '.js'],
    alias: {
      img: path.resolve(__dirname, './public/src/images')
    }
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
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
        }),
      },
      {
        test: /\.js$/, exclude: /node_modules/, loader: ['babel-loader']
      },
      { test: /\.json$/, exclude: /node_modules/, loader: 'json' },
      {
        test: /index\.html/,
        use: htmlLoader()
      },
      {
        test: /\.html$/,
        exclude: /index\.html/,
        use: htmlLoader(true)
      },
      {
        test: /\.(png|svg|gif)$/, loader: 'file-loader?limit=100000', options: { name: 'images/[name].[ext]' }
      }
    ]
  }
};

if (ENVIRONMENT === ENV.DEVELOPMENT) {
  // add modules for hot reloading
  config.entry.bundle.unshift('webpack-hot-middleware/client');
  config.entry.bundle.unshift('webpack/hot/dev-server');
  config.entry.modal.unshift('webpack-hot-middleware/client');
  config.entry.modal.unshift('webpack/hot/dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
  /**
  * PRODUCTION!
  */

  const uglifyJsOptions = {
    sourceMap: true,
    comments: false,
    minimize: true,
    compress: {
      drop_console: true
    }
  };

  const imageminOptions = {
    plugins: [
      imageminGifsicle({ optimizationLevel: 3 }),
      imageminPngQuant(),
      imageminSvgo()
    ]
  };

  // minify JS, compress Images
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin(uglifyJsOptions),
    new ImageminWebpackPlugin({ imageminOptions })
  );
}

module.exports = config;
