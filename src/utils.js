const THROTTLE_TIME = 14;  // 节流函数的间隔时间单位ms, FPS : 1000 / CONSTANT.THROTTLE_TIME

// 工具类
let utils = {
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
    }
};

export default utils;
