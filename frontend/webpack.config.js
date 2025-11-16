const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // Skip type checking for faster builds
            compilerOptions: {
              noUnusedLocals: false,
              noUnusedParameters: false
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 5173,
    hot: true,
    proxy: [
      {
        context: ['/api'],
        target: process.env.WEBPACK_BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  devtool: 'source-map',
  cache: false // Disable caching to avoid issues
};
