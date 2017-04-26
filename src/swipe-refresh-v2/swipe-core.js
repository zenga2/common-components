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
            if(scrollTop!== 0){
                // 兼容scrollIn里的位置计算方法
                pMap.pageYAfterHideTop = pMap.lastY = pMap.startY = currY + scrollTop;

                return toggleTouch(false);
            }

            pMap.pageYAfterHideTop = pMap.lastY = pMap.startY= currY;
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

            if (pMap.isHidden && currY - pMap.pageYAfterHideTop < -10) {
                console.log('dfgdg');
                toggleTouch(false);
            }
        }

        event.preventDefault();

        console.log(pMap.wrapper.scrollTop + '---touchmove');
    }

    function ease() {
        var tlY = pMap.translateY;
        var disY = pMap.disY;
        var newTLY = tlY + disY;

        // 即newTLY不能比-pMap.topBoxHeight小
        newTLY = Math.max(newTLY, -pMap.topBoxHeight);

        return newTLY;
    }

    function touchend(event) {

    }

    function scrollIn(event) {
        toggleTouch(false);

        var scrollTop = pMap.wrapper.scrollTop;
        var currY;

        // 头部未完全隐藏
        if (!pMap.isHidden) {
            console.log('wwww-----1');
            pMap.disY = -scrollTop;
            currY = pMap.lastY + pMap.disY;
            pMap.lastY = currY;
            pMap.wrapper.scrollTop = 0;
            setTranslateY(ease());
        } else {
            console.log('wwww-----2');

            currY = pMap.pageYAfterHideTop - scrollTop;
            pMap.disY = currY - pMap.lastY;
            pMap.lastY = currY;

            if (scrollTop === 0 && pMap.disY > 0) {
                toggleTouch(true);
            }
        }


        console.log('disY: ', pMap.disY)


        // if (scrollTop === 0) {
        //     toggleTouch(true);
        // }


        console.log(pMap.wrapper.scrollTop + '---scrollIn');
    }

    function setTranslateY(tlY) {
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
    function isHittedBottom() {
        var wrapperRect = pMap.wrapper.getBoundingClientRect();
        var bottomRect = pMap.bottomBox.getBoundingClientRect();

        // bottomBox上边框外边缘到wrapper上边框外边缘的距离
        var dis = bottomRect.top - wrapperRect.top;
        return dis < wrapperRect.height;
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
        setCss(pMap.scroller, {
            transform: 'translateY(-66px)',
            marginBottom: '-66px'
        });

        pMap.topBoxHeight = pMap.topBox.clientHeight;
        pMap.translateY = -pMap.topBoxHeight;

        pMap.scroller.addEventListener('touchstart', touchstart);
        pMap.wrapper.addEventListener('scroll', scrollIn);

        window.pMap = pMap;
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