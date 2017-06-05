
// 工具类
var utils = {
    // 属性拷贝
    extend: function(mod, opt) {
        if (!opt) return mod;
        var conf = {};
        for (var attr in mod) {
            if (typeof opt[attr] !== "undefined") {
                conf[attr] = opt[attr];
            } else {
                conf[attr] = mod[attr];
            }
        }
        return conf;
    },
    // 空对象
    isEmptyObject: function (obj) {
        for (var i in obj) {
            return false;
        }
        return true;
    },
    // 节流函数
    throttle: function (now) {
        var time = new Date().getTime();
        this.throttle = function (now) {
            if (now - time > THROTTLE_TIME) {
                time = now;
                return true;
            }
            return false;
        };
        this.throttle(now);
    },
    // 执行回调
    callbackFun: function (ck) {
        try {
            typeof ck === 'function' && ck();
        } catch (ex) {
            throw new Error('flowgrid callback exception:' + ex);
        }
    },
    // 构建节点
    buildNode: function (n, id, opt) {
        var node = {
            id: n.id || id,
            x: n.x,
            y: n.y,
            w: n.w || n.minW || opt.nodeMinW,
            h: n.h || n.minH || opt.nodeMinH,
            minW: n.minW || opt.nodeMinW,
            minH: n.minH || opt.nodeMinH,
        };
        return node;
    }
};

export default utils;