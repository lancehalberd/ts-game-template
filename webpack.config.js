const path = require('path');

module.exports = {
  entry: './app/src/index.tsx',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(ts|js|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js', '.tsx' ],
    alias: {
      'app': path.resolve(__dirname, 'app')
    },
  },
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'public'),
  },
};
