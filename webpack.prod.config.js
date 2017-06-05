var path = require('path')
var webpack = require('webpack')
var utils = require('./utils')
var config = require('../config')

// var vueLoaderConfig = require('./vue-loader.conf')

module.exports = {
	entry: {
		app: './src/app.main.js',
		vendor: ['vue', 'vuex', 'vue-router']
	},
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: '[name].[chunkhash].js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: [path.resolve(__dirname, '../src'), path.resolve(__dirname, '../test')]
			},
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({	// 内部插件
			name: 'vendor' 							// 指定公共 bundle 的名称
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'manifest' //
		})
	]
	// resolve: {
	// 	extensions: ['.js', '.vue', '.json'],
	// 	alias: {
	// 		'vue$': 'vue/dist/vue.esm.js',
	// 		'@': resolve('src')
	// 	}
	// },
	// module: {
	// 	rules: [
	// 		{
	// 			test: /\.vue$/,
	// 			loader: 'vue-loader',
	// 			options: vueLoaderConfig
	// 		},
	// 		{
	// 			test: /\.js$/,
	// 			loader: 'babel-loader',
	// 			include: [resolve('src'), resolve('test')]
	// 		},
	// 		{
	// 			test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
	// 			loader: 'url-loader',
	// 			options: {
	// 				limit: 10000,
	// 				name: utils.assetsPath('img/[name].[hash:7].[ext]')
	// 			}
	// 		},
	// 		{
	// 			test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
	// 			loader: 'url-loader',
	// 			options: {
	// 				limit: 10000,
	// 				name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
	// 			}
	// 		}
	// 	]
	// },
	// // cheap-module-eval-source-map is faster for development
	// devtool: '#cheap-module-eval-source-map',
	// plugins: [
	// 	new webpack.DefinePlugin({
	// 		'process.env': config.dev.env
	// 	}),
	// 	// https://github.com/glenjamin/webpack-hot-middleware#installation--usage
	// 	new webpack.HotModuleReplacementPlugin(),
	// 	new webpack.NoEmitOnErrorsPlugin(),
	// 	// https://github.com/ampedandwired/html-webpack-plugin
	// 	new HtmlWebpackPlugin({
	// 		filename: '../src/index.html',
	// 		template: '../src/index.html',
	// 		inject: true
	// 	}),
	// 	new FriendlyErrorsPlugin()
	// ]
}
