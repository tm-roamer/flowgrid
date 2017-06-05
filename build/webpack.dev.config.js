var path = require('path');

module.exports = {
	entry: './src/index.js',									// 入口文件
	output: {
		path: path.resolve(__dirname, 'docs'),	// 导出路径
		filename: 'flowgrid.js',								// 导出文件名
		library: 'flowgrid',										// 导出变量名
		libraryTarget: 'var' 	// 其他可取值 - amd, commonjs, commonjs2, commonjs-module, this, var
	},
	devtool: '#source-map',							// 生成 source map
	watch: true,												// 启动监听
	// WatchOptions: {
	// 	aggregateTimeout: 300,						// 多次修改的聚合等待时间
	// 	poll: 1000, 											// 每秒检查一次变动
	// 	ignored: /node_modules/
	// }
	// externals: {
	// 	"lodash": {
	// 		commonjs: "lodash",
	// 		commonjs2: "lodash",
	// 		amd: "lodash",
	// 		root: "_"
	// 	}
	// }
	module: {
		rules: [											// 给不同类型的模块文件分配对应的解析器
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: [
					path.resolve(__dirname, 'src')
				]
			}
		]
	}
};
