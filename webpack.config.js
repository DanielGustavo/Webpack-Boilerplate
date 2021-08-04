const path = require('path');

const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveFilesWebpackPlugin = require('remove-files-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

let entryObject = {};

const paths = {
  build: path.resolve(__dirname, 'public', 'dist'),
  src: path.resolve(__dirname, 'src'),
  public: path.resolve(__dirname, 'public'),
};

module.exports = {
  entry: () => {
    entryObject = WebpackWatchedGlobEntries.getEntries([
      path.resolve(paths.src, '**', '!(_)*.@(js|mjs)'),
      path.resolve(paths.src, '**', '!(_)*.@(css|sass|scss)'),
    ])();

    return entryObject;
  },
  resolve: {
    extensions: ['.js', '.mjs'],
  },
  output: {
    path: paths.build,
    filename: ({ chunk }) => {
      const entryName = chunk.name;

      const entry = entryObject[entryName];
      const entryExtension = path.extname(entry);

      let filename = `${entryName}${entryExtension}`;

      if (['.css', '.sass', '.scss'].includes(entryExtension)) {
        filename += '.[REMOVE_AFTER_BUILD]';
      }

      return filename;
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : undefined,
  plugins: [
    new WebpackWatchedGlobEntries(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new RemoveFilesWebpackPlugin({
      after: {
        test: [
          {
            folder: paths.build,
            method: (filename) => /\.\[REMOVE_AFTER_BUILD\]$/.test(filename),
            recursive: true,
          },
        ],
      },
    }),
  ],
  devServer: {
    contentBase: paths.public,
    watchContentBase: true,
    writeToDisk: true,
    inline: true,
  },
};
