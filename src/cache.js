// 网格对象的缓存对象
import {CONSTANT, globalConfig} from './config';
import utils from './utils';
import handleEvent from './event';
import dragdrop from './dragdrop';
import view from './view';
import Flowgrid from './api';

var cache = {
	count: 0,
	get: function (node) {
		var container = view.searchUp(node, CONSTANT.FG_LAYOUT);
		return cache[container.getAttribute(CONSTANT.FG_LAYOUT_INDEX)]
	}
};

export default cache;

// /**
//  * 网格对象的缓存对象
//  */
// export default {
// 	init: function () {
// 		if (!this.arr) this.arr = [];
// 	},
// 	get: function (idx) {
// 		// 避免0的情况, if条件判断麻烦
// 		return this.arr[idx - 1];
// 	},
// 	set: function (obj) {
// 		this.arr.push(obj);
// 		return obj;
// 	},
// 	remove: function(dk) {
// 		this.arr.forEach(function(obj, i, arr) {
// 			dk === obj && arr.splice(i, 1);
// 		});
// 	},
// 	index: function () {
// 		return this.arr.length + 1;
// 	},
// 	list: function() {
// 		return this.arr;
// 	}
// };
