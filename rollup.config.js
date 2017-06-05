import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'src/index.js',
	format: 'umd',
	moduleName: 'flowgrid',
	plugins: [
		json(),
		resolve(),
		babel({
			exclude: 'node_modules/**'
		})
	],
	dest: 'docs/flowgrid.js',
	sourceMap: true
};
