const path = require('path');

module.exports = {
  entry: './app/src/index.tsx',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.(ts|js|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
    alias: {
      'app': path.resolve(__dirname, 'app')
    },
  },
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'public'),
  },
};
