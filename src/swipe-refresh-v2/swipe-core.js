var SwipeCore = (function () {
    var pMap = {
        isBindTouch: false,
        // 页面(translateY)到了-topH之后的pageY
        pageYAfterHideTop: 0,
        // topBox是否隐藏了
        isHidden: true
    };

    function touchstart(event) {
        var touches = event.changedTouches;
        if (touches && touches.length > 0) {
            var scrollTop = pMap.wrapper.scrollTop;
            var currY = touches[0].pageY;

            // scrollTop不为0时，off touchmove
            if (scrollTop !== 0) {
                // 兼容scrollIn里的位置计算方法
                pMap.pageYAfterHideTop = pMap.lastY = pMap.startY = currY + scrollTop;

                return toggleTouch(false);
            }

            pMap.pageYAfterHideTop = pMap.lastY = pMap.startY = currY;
            pMap.disY = 0;

            toggleTouch(true);
        }
    }

    function touchmove(event) {
        var touches = event.changedTouches;
        if (touches && touches.length > 0) {
            var currY = touches[0].pageY;
            pMap.disY = currY - pMap.lastY;
            pMap.lastY = currY;

            setTranslateY(ease());

            // currY-pMap.pageYAfterHideTop<-10表示此时是往上滑的
            if (pMap.isHidden && currY - pMap.pageYAfterHideTop < -10) {
                console.log('dfgdg');
                toggleTouch(false);
            }
        }

        event.preventDefault();
        // console.log(pMap.wrapper.scrollTop + '---touchmove');
    }

    function ease() {
        var tlY = pMap.translateY;
        var disY = pMap.disY;
        var newTLY = tlY + disY;

        // 即newTLY不能比-pMap.topBoxHeight小
        newTLY = Math.max(newTLY, -pMap.topBoxHeight);

        if (newTLY > pMap.slideDownThreshold) {
            newTLY = pMap.slideDownThreshold;
        }
        // 只在下拉过程中使用缓动效果
        else if (disY > 0 && newTLY > 0) {
            var x = tlY / pMap.wrapperHeight;
            x = x > 1 ? 1 : x;
            var ratio = Math.pow(1 - x, 12);
            newTLY = tlY + disY * ratio;
        }

        return newTLY;
    }

    function touchend() {
        var boundary;
        if (!pMap.isHidden) {
            boundary = judgeBoundary();
        } else {
            boundary = isHitBottom() ? 'hitBottom' : 'inTheMiddle'
        }

        fire('moveEnd', {boundary: boundary});
    }

    function scrollIn() {
        toggleTouch(false);

        var scrollTop = pMap.wrapper.scrollTop;
        var currY;

        // 头部未完全隐藏
        if (!pMap.isHidden) {
            // 兼容PC(只在滚动鼠标滑轮时才会用到这段代码)
            console.log('wwww-----1');
            supportPC();
        } else {
            console.log('wwww-----2');

            currY = pMap.pageYAfterHideTop - scrollTop;
            pMap.disY = currY - pMap.lastY;
            pMap.lastY = currY;

            if (scrollTop === 0 && pMap.disY > 0) {
                toggleTouch(true);
            }
        }

        function supportPC() {
            pMap.disY = -scrollTop;
            currY = pMap.lastY + pMap.disY;
            pMap.lastY = currY;
            pMap.wrapper.scrollTop = 0;
            setTranslateY(ease());
        }

        if(isHitBottom()){
            fire('moveEnd', {boundary: 'hitBottom'});
        }

        console.log('disY: ', pMap.disY)
        console.log(pMap.wrapper.scrollTop + '---scrollIn');
    }

    function setTranslateY(tlY, notFire) {
        // 如果连续多次setTranslateY
        // tlY都等于-pMap.topBoxHeight
        // 则只在第一次时修改pMap.pageYAfterHideTop
        if (tlY <= -pMap.topBoxHeight) {
            if (!pMap.isHidden) {
                pMap.pageYAfterHideTop = pMap.lastY;
                pMap.isHidden = true;
            }
        } else {
            pMap.isHidden = false;
        }

        pMap.translateY = tlY;
        setCss(pMap.scroller, {
            transform: 'translateY(' + pMap.translateY + 'px)'
        });

        notFire || fire(judgeBoundary());
    }

    // 判断边界
    function judgeBoundary() {
        var translateY = pMap.translateY;
        // 整个topBox显示出来
        if (translateY > 0) return 'showWholeTop';
        // topBox显示了一部分
        if (translateY > -pMap.topBoxHeight) return 'showPartTop';
        return 'hideTopBox';
    }

    function toggleTouch(flag) {
        // isBindTouch和flag都为false或true时
        // return 不做任何处理
        if (pMap.isBindTouch === flag) {
            return;
        }

        pMap.isBindTouch = flag;
        var arr = flag
            ? ['addEventListener', 'hidden']
            : ['removeEventListener', 'auto'];
        var method = arr[0];
        var scroller = pMap.scroller;
        scroller[method]('touchmove', touchmove);
        scroller[method]('touchend', touchend);
        // pMap.wrapper.style.overflow = arr[1];

        console.log((flag ? 'on' : 'off') + ' touch');
    }

    // 当bottomBox上边框外边缘显示出来时就算触底了
    function isHitBottom() {
        var wrapperRect = pMap.wrapper.getBoundingClientRect();
        var bottomRect = pMap.bottomBox.getBoundingClientRect();

        // bottomBox上边框外边缘到wrapper上边框外边缘的距离
        var dis = bottomRect.top - wrapperRect.top;
        return dis < wrapperRect.height;
    }

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
            ? extendObj(defaultEvent, event)
            : defaultEvent;

        fn && fn(event);
        // console.log(eventType, event);
    }

    function constructor(opts) {
        extendObj(pMap, opts);

        ['wrapper', 'scroller', 'topBox', 'bottomBox'].forEach(function (prop) {
            if (!prop) throw new Error('Invalid argument: property ' + prop + ' cannot be empty');

            pMap[prop] = document.querySelector(pMap[prop]);
        });

        this.pMap = Object.create(pMap);

        init();
    }

    function init() {
        var wrapper = pMap.wrapper
        var scroller = pMap.scroller

        pMap.topBoxHeight = pMap.topBox.clientHeight;
        pMap.translateY = -pMap.topBoxHeight;
        pMap.wrapperHeight = wrapper.clientHeight;
        // 下拉的阈值
        pMap.slideDownThreshold = pMap.wrapperHeight * 0.5;

        setCss(scroller, {
            transform: 'translateY(' + pMap.translateY + 'px)',
            marginBottom: pMap.translateY + 'px'
        });

        scroller.addEventListener('touchstart', touchstart);
        wrapper.addEventListener('scroll', scrollIn);
    }

    return createClass(
        // constructor
        constructor,
        // instance props
        {on: on, off: off, fire: fire, setTranslateY: setTranslateY},
        // static
        {}
    );
})();