
import {CONSTANT} from './config'

let utils = {
	// 节流函数
	throttle: function (now) {
		let time = new Date().getTime();
		this.throttle = function (now) {
			if (now - time > CONSTANT.THROTTLE_TIME) {
				time = now;
				return true;
			}
			return false;
		};
		this.throttle(now);
	},
	// 查找DOM节点
	searchUp: function (ele, type) {
		if (ele === document.body || ele === document) return undefined;   // 向上递归到顶就停
		if (ele.classList.contains(type)) return ele;
		return this.searchUp(ele.parentNode, type);
	}
}

export default utils;
