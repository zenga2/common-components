window.requestAnimationFrame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || function (fn) {
        setTimeout(fn, 1000 / 60)
    }

var SwipeRefresh = (function () {
    // 保存dom
    var $Map = (function () {
        var $wrapper = $("#wrapper");
        var $scroller = $wrapper.find("#scroller");
        var $topTipBox = $scroller.find(".pull_wrap");
        var $dataBox = $scroller.find(".list_wrap");
        var $bottomBox = $scroller.find(".load_wrap");
        return {
            "wrapper": $wrapper,
            "scroller": $scroller,
            "topTipBox": $topTipBox,
            "topTipImg": $topTipBox.find("span"),
            "topTipText": $topTipBox.find("p"),
            "dataBox": $dataBox,
            "bottomBox": $bottomBox
        };
    })();

    // 保存各种全局参数
    var pMap = (function () {
        var topTipBoxHeight = $Map.topTipBox.outerHeight();
        return {
            "wrapperHeight": $("article").height(),
            "scrollerHeight": 0,
            "topTipBoxHeight": topTipBoxHeight,
            "dataBoxHeight": 0,
            // 上一次触发touchmove时的pageY值
            "lastY": null,
            // 滑动间隔（每次touchmove时间间隔里，手指在Y方向滑动的距离）
            "disY": 0,
            // 当前的滑动速度
            "currV": 0,
            // 上一次触发touchmove时的时间(ms)
            "lastTime": null,
            "translateY": -topTipBoxHeight,
            // 上滑的阈值
            "slideUpThreshold": null,
            // 是否已全部加载
            "isLoaded": false
        };
    })();

    // 常数
    var constMap = {
        // 下拉时是否要刷新的translateY值
        "startRefreshTLY": 0,
        // 计算当前速度所用的时间间隔(ms)
        "interval": 50,
        // 自由滑动的阻滞系数(px/(ms)^2)
        "a": 0.001,
        "loadedTip": "已全部加载!",
        "loadingTip": "正在加载中...",
        "beforeRefreshTip": "下拉刷新",
        "startRefreshTip": "释放刷新",
        "refreshingTip": "刷新中，请稍等...",
        "refreshedTip": "刷新成功"
    };

    // 保存各种全局标识
    var flagMap = {
        // 标识当前滑动的状态
        "currState": "",
        // 一次触摸中，是否触发了touchmove事件
        "isTouchMove": false
    };

    function insertStyleAndHtml() {
        $Map.wrapper.css({
            "overflow": "hidden",
            "background-color": "#f0f1f5",
            "height": pMap.wrapperHeight
        });
        $Map.scroller.css({
            "transform": "translate3d(0,-0.66rem,0)"
        });

        $Map.topTipImg.css({
            "transform": "translate3d(0," + (-pMap.topTipBoxHeight) + "px,0)"
        });

        $Map.bottomBox.hide()
    }

    function touchstart(e) {
        console.log("-----------start---------");
        console.log("touchstart");
        var touches = e.originalEvent.changedTouches;
        if (touches && touches.length > 0) {
            moveStart(touches[0].pageY);
        }

        e.preventDefault();
    }

    function moveStart(currY) {
        pMap.scrollerHeight = $Map.scroller.height();
        pMap.dataBoxHeight = $Map.dataBox.height();
        pMap.lastY = currY;
        pMap.disY = 0;
        pMap.currV = 0;
        pMap.lastTime = +(new Date);

        // 上滑的阈值
        var slideUpThreshold = pMap.wrapperHeight - pMap.scrollerHeight
        pMap.slideUpThreshold = slideUpThreshold > -pMap.topTipBoxHeight
            ? -pMap.topTipBoxHeight
            : slideUpThreshold


        flagMap.isTouchMove = false;

        console.log("on touch")
        console.log(pMap)
        $Map.scroller.on("touchmove", touchmove);
        $Map.scroller.on("touchend", touchend);
        $Map.scroller.on("touchcancel", touchend)
    }

    function touchmove(e) {
        if (flagMap.isTouchMove === false) {
            flagMap.isTouchMove = true;
        }

        var touches = e.originalEvent.changedTouches;
        if (touches && touches.length > 0) {
            // 滑动过程中
            moveIn(touches[0].pageY);
        }

        e.preventDefault();
    }

    // 滑动过程中
    // currY：当前的pageY
    // pMap.wrapperHeight既可能比pMap.scrollerHeight大，也可能比其小
    var i = 0;

    function moveIn(currY) {
        pMap.disY = currY - pMap.lastY;
        pMap.lastY = currY;

        setTranslateY(ease(pMap.translateY, pMap.disY));

        if (pMap.translateY > -pMap.topTipBoxHeight) {
            // 随着滑动的进行修改头部的提示效果
            changeTopBox(pMap.translateY);
            console.log("------changeTopBox-----")
        } else if (pMap.translateY <= pMap.slideUpThreshold) {
            // 随着滑动的进行修改底部的提示效果
            changeBottomBox()
            console.log("------changeBottomBox-----")

            $Map.scroller.off("touchmove", touchmove);
        }

        // 计算当前的滑动速度
        var currTime = +(new Date);
        var t = currTime - pMap.lastTime;
        if (t > constMap.interval) {
            pMap.currV = pMap.disY / t;
            pMap.lastTime = currTime;
        }
    }

    // 缓动效果
    function ease(tlY, disY) {
        var slideUpThreshold = pMap.slideUpThreshold
        var newTLY = tlY + disY;

        if (newTLY > pMap.wrapperHeight) {
            newTLY = pMap.wrapperHeight * 0.75
        } else if (newTLY > 0) {
            var x = tlY / pMap.wrapperHeight;
            x = x > 1 ? 1 : x;
            var ratio = Math.pow(1 - x, 12);
            disY = disY * ratio;
            newTLY = tlY + disY
        } else if (newTLY < slideUpThreshold) {
            newTLY = slideUpThreshold;
        }

        return newTLY;
    }

    // 随着滑动的进行修改头部的提示效果
    // todo 可以修改成触发事件式
    function changeTopBox(tlY) {
        // 整个头部显示出来
        if (tlY > 0) {
            // 确保在连续触发touchmove时只执行一次
            if (flagMap.currState !== "showWholeTop") {
                flagMap.currState = "showWholeTop";
                $Map.topTipText.text(constMap.startRefreshTip);
                $Map.topTipImg.css({
                    "transition": "all 350ms",
                    "transform": "translate3d(0,0,0)"
                });
            }
        }
        // 头部的bottom开始显示出来
        else if (tlY > -pMap.topTipBoxHeight) {
            // 确保在连续触发touchmove时只执行一次
            if (flagMap.currState !== "startShowTop") {
                flagMap.currState = "startShowTop";
                $Map.topTipText.text(constMap.beforeRefreshTip);
                $Map.topTipImg.css({
                    "transition": "all 350ms",
                    "transform": "translate3d(0," + (-pMap.topTipBoxHeight) + "px,0)"
                });
            }
        }
    }

    // 修改底部的提示效果
    function changeBottomBox() {
        if (pMap.isLoaded) {
            $Map.bottomBox.text(constMap.loadedTip);
            if ($Map.bottomBox.is(":hidden")) {
                $Map.bottomBox.show();
                refresh();
            }
        } else {
            $Map.bottomBox.text(constMap.loadingTip);
            if ($Map.bottomBox.is(":hidden")) {
                $Map.bottomBox.show()
                refresh()
            }
        }
    }

    function offTouchEvent() {
        $Map.scroller.off("touchstart", touchstart);
        $Map.scroller.off("touchmove", touchmove);
        $Map.scroller.off("touchend", touchend);
        $Map.scroller.off("touchcancel", touchend);
    }

    function touchend(e) {
        var currV = pMap.currV;
        var lastY = pMap.lastY;

        console.log('currV: ' + currV)
        console.log("off touch")
        offTouchEvent()

        if (currV === 0 || pMap.translateY > -pMap.topTipBoxHeight) {
            console.log(1)
            // 滑动过程结束
            moveEnd();
        } else if (currV > 0) {
            console.log(2)
            movefreely(Math.abs(currV), constMap.a, "down", lastY);
        } else {
            console.log(3)
            movefreely(Math.abs(currV), constMap.a, "up", lastY);
        }

        // 触发click和mousedown事件
        if (flagMap.isTouchMove === false) {
            $(e.target)
            // .trigger("mousedown");
            // .trigger("click");
        }

        e.preventDefault();
    }

    // 滑动过程结束
    function moveEnd() {
        if (pMap.translateY >= -pMap.topTipBoxHeight) {
            $Map.scroller.css({
                "transition": "all 350ms"
            });
        }

        // 下拉到了TopBox完全露出来了，此时开始刷新的操作
        if (pMap.translateY >= constMap.startRefreshTLY) {
            setTranslateY(0);
            $Map.topTipText.text(constMap.refreshingTip);
            $Map.topTipImg.attr("class", "pull_load");

            setTimeout(refreshSuccess, 3000);
        }
        // TopBox只露出一部分，这时直接回弹
        else if (pMap.translateY > -pMap.topTipBoxHeight) {
            hideTopBox();
            onTouchStrat();
        }
        // 上滑到了底部，进行加载操作
        else if (pMap.translateY <= pMap.slideUpThreshold) {
            setTimeout(function () {
                if (i++ < 3) {
                    loadData();
                    onTouchStrat();
                } else {
                    pMap.isLoaded = true;
                    changeBottomBox();
                    hideBottomBox(onTouchStrat);
                }
            }, 1000)
        } else {
            onTouchStrat();
        }

        console.log("touchend");
        console.log("-----------end---------");
    }

    function onTouchStrat() {
        console.log('on touch strat');
        $Map.scroller.on("touchstart", touchstart);
    }

    function hideBottomBox(callback) {
        setTimeout(function () {
            $Map.bottomBox.hide();
            refresh()

            callback && callback();
        }, 1500);
    }

    // 当BottomBox的显示状态改变时，刷新相关的状态值
    function refresh() {
        pMap.scrollerHeight = $Map.scroller.height();
        // 上滑的阈值
        var slideUpThreshold = pMap.wrapperHeight - pMap.scrollerHeight;
        pMap.slideUpThreshold = slideUpThreshold > -pMap.topTipBoxHeight
            ? -pMap.topTipBoxHeight
            : slideUpThreshold;

        $Map.scroller.css('transition', 'all 350ms')
        setTranslateY(pMap.slideUpThreshold);

        setTimeout(function () {
            $Map.scroller.css('transition', '')
        }, 350)
    }

    // 刷新成功
    function refreshSuccess() {
        loadData()

        $Map.topTipImg.attr("class", "pull_success");
        $Map.topTipText.text(constMap.refreshedTip);
        setTimeout(function () {
            hideTopBox();
            onTouchStrat();
        }, 500);
    }

    // 隐藏顶部的提示框
    function hideTopBox() {
        $Map.topTipImg.attr("class", "pull_down");
        setTranslateY(-pMap.topTipBoxHeight);
        setTimeout(function () {
            $Map.scroller.css('transition', '')
        }, 500);
    }

    function setTranslateY(tlY) {
        pMap.translateY = tlY;
        console.log(tlY)
        $Map.scroller.css({
            "transform": "translate3d(0," + pMap.translateY + "px,0)"
        });
    }

    // touchend后，带阻力的自由滑动
    // v0：初始速度， a：加速度  direction 初始运动方向(up向上 down向下)
    function movefreely(v0, a, direction, lastTLY) {
        var startTime = +(new Date);
        var timeOfMaxDis = v0 / a;
        var maxDis = 0.5 * v0 * v0 / a;

        function calculateDistance(t) {
            var dis = (v0 - 0.5 * a * t) * t;

            return t < timeOfMaxDis ? dis : maxDis;
        }

        requestAnimationFrame(function fn() {
            var t = +(new Date) - startTime;
            var currDis = calculateDistance(t);
            direction = currDis === maxDis ? "stop" : direction

            // 限制惯性滑动的边界
            // 下拉最多到topBox显示出来，上滑最多到底部（触发加载机制）
            if (pMap.translateY > 0 || pMap.translateY <= pMap.slideUpThreshold) {
                direction = "stop";
            }

            moveTo(currDis, direction, lastTLY);

            if (direction !== "stop") {
                requestAnimationFrame(fn)
            }
        })
    }

    // 滑动
    function moveTo(dis, direction, lastTLY) {
        if (direction === "up") {
            moveIn(lastTLY - dis);
        } else if (direction === "down") {
            moveIn(lastTLY + dis);
        } else if (direction === "stop") {
            moveEnd();
        }
    }

    function SwipeRefresh(option) {
        onTouchStrat()
    }

    SwipeRefresh.prototype.refresh = function () {

    }

    SwipeRefresh.prototype.scrollTo = function (scrollTop) {

    }

    SwipeRefresh.prototype.on = function (eventType, fn) {

    }

    SwipeRefresh.prototype.off = function (eventType, fn) {

    }

    return SwipeRefresh;
})();