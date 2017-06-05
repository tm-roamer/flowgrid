var path = require('path');

module.exports = {
	entry: './src/index.js',									// 入口文件
	output: {
		path: path.resolve(__dirname, 'docs'),	// 导出路径
		filename: 'flowgrid.js',								// 导出文件名
		library: 'flowgrid',										// 导出变量名
		libraryTarget: 'umd' 	// 其他可取值 - amd, commonjs, commonjs2, commonjs-module, this, var
	}
	// externals: {
	// 	"lodash": {
	// 		commonjs: "lodash",
	// 		commonjs2: "lodash",
	// 		amd: "lodash",
	// 		root: "_"
	// 	}
	// }
};
