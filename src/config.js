
// 常量
export const CONSTANT = {
	THROTTLE_TIME: 15,                             	  // 节流函数的间隔时间, 单位ms, FPS = 1000 / THROTTLE_TIME
	THROTTLE_LAZY_TIME: 100														// 节流函数的懒执行间隔时间, 单位ms
}

// 全局配置
export const globalConfig = {
	row: 7,                                            // 网格布局的默认行,默认7行
	col: 12,                                           // 网格布局的默认列,默认12列
	distance: 5,                                       // 触发拖拽的拖拽距离,默认5px
	draggable: true,                                   // 是否允许拖拽, 默认允许
	resizable: true,                                   // 是否允许缩放, 默认允许
	nodeMinW: 2,                                       // 节点块的最小宽度, 默认占2格
	nodeMinH: 2,                                       // 节点块的最小高度, 默认占2格
	overflow: 5,                                       // 当拖拽或缩放超出网格容器的溢出像素
	padding: {                                         // 节点块之间的间距, 默认都为5px
		top: 5,
		left: 5,
		right: 5,
		bottom: 5
	},
	cellScale: {                                       // 单元格的宽高比例, 默认16:9
		w: 16,
		h: 9
	},
	addNodeSize: {                                     // 添加节点的默认尺寸
		x: 0,
		y: 0,
		w: 2,
		h: 2
	}
}
