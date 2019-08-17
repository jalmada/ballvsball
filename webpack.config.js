const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');

var config = {
  output: {
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test:/\.css$/,
        use:['style-loader','css-loader']
      },
      //This is temporal as the location will be the webserver.
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            }
          }
        ]
      }
      ///////
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    port: 9000
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    })
  ]
};

module.exports = (env, argv)=> {

  if (argv.mode === 'production') {
    config.output.path = path.resolve('../ballvsball-backend/public/'),
    config.output.filename = 'javascripts/main.js'
  }

  return config;
}