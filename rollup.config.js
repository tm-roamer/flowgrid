import vue from 'rollup-plugin-vue2';
import css from 'rollup-plugin-css-only';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'src/index.js',
	format: 'umd',
	moduleName: 'flowgrid',
	plugins: [
		vue(),
		css(),
		json(),
		resolve({ browser: true, jsnext: true, main: true }),
		commonjs(),
		babel({
			exclude: 'node_modules/**'
		})
	],
	external: ['vue'],
	dest: 'docs/flowgrid.js',
	sourceMap: true
};
