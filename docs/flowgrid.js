(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.flowgrid = factory());
}(this, (function () { 'use strict';

var version = "1.2.1";

var fgContainer = {
  render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-container" }, [_c('div', { staticClass: "fg-layout" }, [_vm._t("default")], 2)]);
  },
  staticRenderFns: [],
  data: function data() {
    return {};
  }
};

// 常量

// 网格对象的缓存对象


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

var fgItem = {
  render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-item" }, [_c('div', { staticClass: "fg-item-content" }, [_vm._t("default")], 2), _vm._v(" "), _c('div', { staticClass: "fg-item-zoom-bar" })]);
  },
  staticRenderFns: [],
  data: function data() {
    return {};
  }
};

var index = {
	version: version,
	fgContainer: fgContainer,
	fgItem: fgItem
};

return index;

})));
//# sourceMappingURL=flowgrid.js.map
