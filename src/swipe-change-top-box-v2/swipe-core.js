var SwipeCore = (function () {
    var pMap = {
        isBindTouch: false,
        // 页面(translateY)到了-topH之后的pageY
        pageYAfterHideTop: 0,
        // topBox是否隐藏了
        isHidden: true,
        isWeixinBrowser: (/micromessenger/i).test(navigator.userAgent),
        setTranslateY: setTranslateY
    };

    function touchstart(event) {
        pMap.isFireHitBottom = false;

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
                toggleTouch(false);
            }
        }
        event.preventDefault();
    }

    function ease() {
        var tlY = pMap.translateY;
        var disY = pMap.disY;
        var newTLY = tlY + disY;

        // 即newTLY不能比0小(因为再往下是原生滑动了)
        newTLY = Math.max(newTLY, 0);

        if (newTLY > pMap.slideDownThreshold) {
            newTLY = pMap.slideDownThreshold;
        }
        // 只在下拉过程中使用缓动效果
        else if (disY > 0) {
            var x = tlY / pMap.wrapperHeight;
            x = x > 1 ? 1 : x;
            var ratio = Math.pow(1 - x, 12);
            newTLY = tlY + disY * ratio;
        }

        return newTLY;
    }

    function touchend() {
        if (pMap.translateY > 0) {
            pMap.rebound && pMap.rebound(pMap);
        }
    }

    function scrollIn() {
        toggleTouch(false);

        var scrollTop = pMap.wrapper.scrollTop;
        var currY;

        // 头部未完全隐藏
        currY = pMap.pageYAfterHideTop - scrollTop;
        pMap.disY = currY - pMap.lastY;
        pMap.lastY = currY;

        if (scrollTop === 0 && pMap.disY > 0 && !pMap.isWeixinBrowser) {
            toggleTouch(true);
        }
    }

    function setTranslateY(tlY) {
        // 如果连续多次setTranslateY
        // tlY都等于-pMap.topBoxHeight
        // 则只在第一次时修改pMap.pageYAfterHideTop
        if (tlY <= 0) {
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

        pMap.scroll && pMap.scroll(pMap);
    }

    function toggleTouch(flag) {
        // isBindTouch和flag都为false或true时
        // return 不做任何处理
        if (pMap.isBindTouch === flag) {
            return;
        }

        pMap.isBindTouch = flag;
        var method = flag
            ? 'addEventListener'
            : 'removeEventListener';
        var scroller = pMap.scroller;
        scroller[method]('touchmove', touchmove);
        scroller[method]('touchend', touchend);
    }

    function constructor(opts) {
        extend(pMap, opts);

        ['wrapper', 'scroller'].forEach(function (prop) {
            var val = pMap[prop];
            if (!val) throw new Error('Invalid argument: property ' + prop + ' cannot be empty');

            pMap[prop] = document.querySelector(val);
        });

        this.pMap = Object.create(pMap);

        init();
    }

    function init() {
        var wrapper = pMap.wrapper
        var scroller = pMap.scroller

        pMap.topBoxHeight = 0;
        pMap.translateY = 0;
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
        {},
        // static
        {}
    );
})();