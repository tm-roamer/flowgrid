// 缓存对象
let cache = {
	init: function () {
		if (!this.arr) this.arr = [];
	},
	get: function (idx) {
		// 避免0的情况, if条件判断麻烦
		return this.arr[idx - 1];
	},
	set: function (obj) {
		this.arr.push(obj);
		return this.index();
	},
	remove: function(index) {
		this.arr.splice(index, 1);
	},
	index: function () {
		return this.arr.length;
	},
	list: function() {
		return this.arr;
	}
};

export default cache;
