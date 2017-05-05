var SwipeCore = (function () {
    // 保存各种全局参数
    var pMap = null;

    // 常数
    var constMap = {
        // 计算当前速度所用的时间间隔(ms)
        interval: 50,
        // 自由滑动的阻滞系数(px/(ms)^2)
        a: 0.001,
        minDis: 30,

        // 惯性滑动时的方法标识
        "DOWN": "down",
        "UP": "up",
        "STOP": "stop"
    };

    // 初始化各种全局参数
    function initState(option) {
        var topBoxHeight = option.topBox.clientHeight;

        pMap = {
            // 是否启用到底部还可以继续滑动(默认不容许)
            allowScrollAfterHitBottom: false,
            // 是否触发click
            click: false
        };

        extend(pMap, option);

        var wrapperHeight = option.initHeight || pMap.wrapper.clientHeight;

        extend(pMap, {
            wrapperHeight: wrapperHeight,
            scrollerHeight: null,
            // 上滑的阈值
            slideUpThreshold: null,
            topBoxHeight: topBoxHeight,
            // scroller的translateY的初始值
            translateY: -topBoxHeight,
            // 上一次触发touchmove时的pageY值
            lastY: null,
            // 滑动间隔（每次touchmove时间间隔里，手指在Y方向滑动的距离）
            disY: 0,
            // 当前的滑动速度
            currV: 0,
            // 上一次触发touchmove时的时间(ms)
            lastTime: null,
            // 一次触摸中，是否触发了touchmove事件
            isTouchMove: false
        });
    }

    // 初始化一些样式
    function initStyle() {
        setCss(pMap.wrapper, {
            overflow: 'hidden',
            height: pMap.wrapperHeight + 'px'
        });

        setCss(pMap.scroller, {
            transform: 'translate3d(0,' + (-pMap.topBoxHeight) + 'px,0)'
        });
    }

    function touchstart(e) {
        var touches = e.changedTouches;
        if (touches && touches.length > 0) {
            fire('touchstart');

            pMap.startY = touches[0].pageY;
            moveStart();
            console.log(touches[0].pageY);
        }

        e.preventDefault();
    }

    function moveStart() {
        // 刷新 scrollerHeight|topBoxHeight|slideUpThreshold
        refresh();
        // 上一次触发touchmove时的pageY值
        pMap.lastY = pMap.startY;
        pMap.disY = 0;
        pMap.currV = 0;
        pMap.lastTime = +(new Date);

        pMap.isTouchMove = false;

        pMap.scroller.addEventListener('touchmove', touchmove);
        pMap.scroller.addEventListener('touchend', touchend);
        pMap.scroller.addEventListener('touchcancel', touchend);
        fire('afterTouchStart');
    }

    function touchmove(e) {
        if (pMap.isTouchMove === false) {
            pMap.isTouchMove = true;
        }

        var touches = e.changedTouches;
        if (touches && touches.length > 0) {
            // 滑动过程中
            moveIn(touches[0].pageY);
            console.log(touches[0].pageY);
        }

        e.preventDefault();
    }

    // 滑动过程中
    // currY：当前的pageY
    // pMap.wrapperHeight既可能比pMap.scrollerHeight大，也可能比其小
    function moveIn(currY) {
        pMap.disY = currY - pMap.lastY;
        pMap.lastY = currY;

        setTranslateY(ease(pMap.translateY, pMap.disY));

        // 判断边界,并做相应的处理
        constMap.fnMap = constMap.fnMap || {
                // 整个topBox显示出来
                showWholeTop: function () {
                    fire('showWholeTop');
                },
                // topBox显示了一部分
                showPartTop: function () {
                    fire('showPartTop');
                },
                // 中间一般滑动过程
                inTheMiddle: function () {
                    fire('inTheMiddle');
                },
                // 到了底部
                hitBottom: function () {
                    fire('hitBottom');

                    // 到底部后，禁止再继续滑动
                    if (!pMap.allowScrollAfterHitBottom) {
                        pMap.scroller.removeEventListener("touchmove", touchmove);
                    }
                }
            };

        var fn = constMap.fnMap[judgeBoundary()];
        fn && fn();

        // 计算当前的滑动速度
        calculateSpeed();
    }

    // 判断边界
    function judgeBoundary() {
        var translateY = pMap.translateY;
        var boundary = "";

        // 整个topBox显示出来
        if (translateY > 0) {
            boundary = 'showWholeTop';
        }
        // topBox显示了一部分
        else if (translateY > -pMap.topBoxHeight) {
            boundary = 'showPartTop';
        }
        // 中间一般滑动过程
        else if (translateY > pMap.slideUpThreshold) {
            boundary = 'inTheMiddle';
        }
        // 到了底部
        else if (translateY <= pMap.slideUpThreshold) {
            // 解决当scrollerHeight <= wrapperHeight + pMap.topBoxHeight，
            // 会出现小幅下拉触发boundary = 'hitBottom'的问题；
            // 或则当加载数据后，小幅下拉触发boundary = 'hitBottom'的问题
            if (pMap.lastY - pMap.startY < -constMap.minDis) {
                boundary = 'hitBottom';
            }
        }

        return boundary;
    }

    // 计算当前的滑动速度
    function calculateSpeed() {
        var currTime = +(new Date);
        var t = currTime - pMap.lastTime;
        if (t > constMap.interval) {
            pMap.currV = pMap.disY / t;
            pMap.lastTime = currTime;
        }
    }

    // 缓动效果
    function ease(tlY, disY) {
        var slideUpThreshold = pMap.slideUpThreshold;
        var newTLY = tlY + disY;

        if (newTLY > pMap.wrapperHeight) {
            newTLY = pMap.wrapperHeight * 0.75
        } else if (newTLY > 0) {
            var x = tlY / pMap.wrapperHeight;
            x = x > 1 ? 1 : x;
            var ratio = Math.pow(1 - x, 12);
            newTLY = tlY + disY * ratio;
        } else if (newTLY < slideUpThreshold) {
            newTLY = slideUpThreshold;
        }

        return newTLY;
    }

    function offTouchEvent() {
        var scroller = pMap.scroller;
        scroller.removeEventListener("touchstart", touchstart);
        scroller.removeEventListener("touchmove", touchmove);
        scroller.removeEventListener("touchmove", touchmove);
        scroller.removeEventListener("touchmove", touchmove);
    }

    function touchend(e) {
        var currV = pMap.currV;
        var currY;
        var touches = e.changedTouches;
        if (touches && touches.length > 0) {
            offTouchEvent();

            currY = touches[0].pageY;
            pMap.disY = currY - pMap.lastY;
            pMap.lastY = currY;

            setTranslateY(ease(pMap.translateY, pMap.disY));

            if (currV === 0 || pMap.translateY > -pMap.topBoxHeight) {
                // 滑动过程结束
                moveEnd();
            } else if (currV > 0) {
                movefreely(Math.abs(currV), constMap.a, constMap.DOWN, pMap.lastY);
            } else {
                movefreely(Math.abs(currV), constMap.a, constMap.UP, pMap.lastY);
            }
        }

        // 触发click和mousedown事件
        if (pMap.click && pMap.isTouchMove === false) {
            // trigger('mousedown', e.target);
            trigger('click', e.target);
        }

        e.preventDefault();
    }

    function trigger(type, target) {
        if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
            var ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
            ev.initEvent(type, true, true);
            ev._constructed = true;
            target.dispatchEvent(ev);
        }
    }

    // 滑动过程结束
    function moveEnd() {
        // 判断边界
        var boundary = judgeBoundary();

        fire('moveEnd', {boundary: boundary});
    }

    // touchend后，带阻力的自由滑动
    // v0：初始速度， a：加速度  direction 初始运动方向(up向上 down向下)
    function movefreely(v0, a, direction, lastY) {
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

            // 限制惯性滑动的边界
            // 1) 惯性滑动到最大距离
            if (currDis === maxDis
                // 2) 下拉最多到topBox显示出来
                || pMap.translateY > 0
                // 3) 上滑最多到底部（触发加载机制）
                || pMap.translateY <= pMap.slideUpThreshold) {

                direction = constMap.STOP;
            }

            // 滑动
            if (direction === constMap.UP) {
                moveIn(lastY - currDis);
            } else if (direction === constMap.DOWN) {
                moveIn(lastY + currDis);
            } else if (direction === constMap.STOP) {
                moveEnd();
            }

            if (direction !== constMap.STOP) {
                requestAnimationFrame(fn);
            }
        })
    }

    // 绑定touchstart
    function initTouchEvent() {
        pMap.scroller.addEventListener("touchstart", touchstart);
    }

    // 设置scroller的translateY的值
    function setTranslateY(tlY) {
        pMap.translateY = tlY;
        setCss(pMap.scroller, {
            "transform": "translate3d(0," + pMap.translateY + "px,0)"
        });
    }

    /********************************* create class in follow ******************************************/
    // 构造函数
    function constructor(option) {
        var self = this;
        // 获取dom
        ['wrapper', 'scroller', 'topBox', 'bottomBox'].forEach(function (prop) {
            var val = option[prop];
            if (!val) throw new Error('Invalid argument: property ' + prop + ' cannot be empty');

            self[prop] = option[prop] = document.querySelector(val);
        });

        initState(option);
        initStyle(option);
        initTouchEvent();
        fire('afterInit');
    }

    // 刷新相关的状态值
    // wrapperHeight|scrollerHeight|topBoxHeight|slideUpThreshold
    function refresh(warpperHeight) {
        if (warpperHeight) {
            pMap.wrapperHeight = warpperHeight;
            setCss(pMap.wrapper, {
                height: pMap.wrapperHeight + 'px'
            });
        }

        pMap.scrollerHeight = pMap.scroller.clientHeight;
        pMap.topBoxHeight = pMap.topBox.clientHeight;
        // 上滑的阈值
        var slideUpThreshold = pMap.wrapperHeight - pMap.scrollerHeight;
        pMap.slideUpThreshold = Math.min(slideUpThreshold, -pMap.topBoxHeight);
    }

    // duration(ms毫秒)
    function scrollTo(scrollTop, duration, fn) {
        setCss(pMap.scroller, {
            transition: 'all ' + duration + 'ms'
        });
        setTranslateY(-scrollTop);

        setTimeout(function () {
            setCss(pMap.scroller, {transition: ''});
            fn && fn();
        }, duration);
    }

    // 加载或刷新数据后需要执行该方法
    function done() {
        initTouchEvent();
    }

    // supoort: startShowTop, showWholeTop, inTheMiddle, hitBottom, moveEnd
    // supoort: initStyle, touchstart, afterTouchStart
    function on(eventType, fn) {
        eventType = 'on' + firstLetterToUpperCase(eventType);
        pMap[eventType] = fn;
    }

    function off(eventType) {
        eventType = 'on' + firstLetterToUpperCase(eventType);
        pMap[eventType] = null;
    }

    function fire(eventType, event) {
        // 通过defaultEvent只能读取pMap的属性，不能修改
        var defaultEvent = Object.create(pMap);
        defaultEvent.type = eventType;

        eventType = 'on' + firstLetterToUpperCase(eventType);
        var fn = pMap[eventType];

        event = (event && typeof event === 'object')
            ? extend(defaultEvent, event)
            : defaultEvent;

        fn && fn(event);
    }

    return createClass(
        // constructor
        constructor,
        // instanceProps
        {
            refresh: refresh,
            scrollTo: scrollTo,
            done: done,
            on: on,
            off: off
        },
        // staticProps
        {}
    );
})();