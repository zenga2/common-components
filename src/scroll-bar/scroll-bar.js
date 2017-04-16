// todo add click event(因为event.preventDefault()屏蔽了click事件)
var ScrollBar = (function () {
    // 给元素增加内联样式
    function insertStyle(el, styleObj) {
        Object.keys(styleObj).forEach(function (prop) {
            el.style[prop] = styleObj[prop]
        })
    }

    function insertStyleAndHtml(thisObj) {
        // 给wrapper元素增加初始化样式
        insertStyle(thisObj.wrapper, {
            position: 'relative',
            overflowY: 'hidden'
        })

        var clientH = thisObj.wrapper.clientHeight
        var scrollH = thisObj.wrapper.scrollHeight
        // 增加滚动条
        thisObj.scrollBar = document.createElement('div')
        thisObj.wrapper.appendChild(thisObj.scrollBar)

        // 设置滚动条的高度
        var scrollBarH = clientH < scrollH ? clientH * clientH / scrollH : 0

        // 给滚动条增加样式
        insertStyle(thisObj.scrollBar, {
            position: 'absolute',
            top: 0,
            right: 0,
            width: '3px',
            height: scrollBarH + 'px',
            background: thisObj.scrollBarColor,
            opacity: '0'
        })
    }

    // 绑定touch事件的工具方法
    function bindTouchEvent(option) {
        var el = option.el
        var typeArr = ['touchstart', 'touchmove', 'touchend', 'touchcancel']

        typeArr.forEach(function (eventType) {
            el.addEventListener(eventType, option[eventType])
        })
    }

    // 缓动函数
    function ease(tlY, disY, clientH) {
        var x = tlY / clientH
        if (x > 1) {
            x = 1
        }
        var ratio = Math.pow(1 - x, 15)
        disY = disY * ratio;
        console.log('x: ' + x + ' ratio: ' + ratio + ' disY: ' + disY)
        return tlY + disY
    }

    function setTranslateY(tlY, thisObj) {
        thisObj.translateY = tlY

        var clientH = thisObj.wrapper.clientHeight
        var scrollH = thisObj.wrapper.scrollHeight
        var scrollBarTLY = -tlY * clientH / scrollH
        thisObj.scrollBar.style.transform = 'translate3d(0,' + scrollBarTLY + 'px,0)'
        thisObj.scroller.style.transform = 'translate3d(0,' + tlY + 'px,0)'
    }

    function toggleScrollBar(flag, thisObj) {
        var scrollBar = thisObj.scrollBar
        scrollBar.style.transition = 'opacity 500ms'
        scrollBar.style.opacity = flag ? 1 : 0
    }

    // 初始化touch事件
    function initEvent(thisObj) {
        // touchstart时的pageY
        var startY;
        // translateY的偏移值
        var tlY;
        // 上一次的pageY
        var lastY;

        var clientH = thisObj.wrapper.clientHeight
        var scrollH = thisObj.wrapper.scrollHeight

        function touchstart(event) {
            var touch = event.changedTouches[0]
            if (touch) {
                lastY = startY = touch.pageY
                tlY = thisObj.translateY
                console.log('startY: ' + startY)

                // 显示滚动条
                toggleScrollBar(true, thisObj)
            }

            event.preventDefault()
        }

        function touchmove(event) {
            var touch = event.changedTouches[0]
            if (touch) {
                var pageY = touch.pageY
                var disY = pageY - lastY
                lastY = pageY

                // 上滑的阈值
                var slideUpThreshold = clientH - scrollH
                // 下滑的阈值
                var slideDownThreshold = clientH * thisObj.slideDownRatio

                tlY = thisObj.allowSlideDown && tlY > 0 ? ease(tlY, disY, clientH) : tlY + disY
                console.log('disY: ' + disY)

                if (tlY < slideUpThreshold) {
                    tlY = slideUpThreshold
                } else if (tlY > slideDownThreshold) {
                    tlY = slideDownThreshold
                }

                setTranslateY(tlY, thisObj)
            }

            event.preventDefault()
        }

        function touchend(event) {
            // 隐藏滚动条
            toggleScrollBar(false, thisObj)

            if (tlY > 0) {
                thisObj.scrollTo(0, 350)
            }

            event.preventDefault()
        }

        bindTouchEvent({
            el: thisObj.scroller,
            touchstart: touchstart,
            touchmove: touchmove,
            touchend: touchend,
            // 当出现系统弹框等情况时，触发touchcancel，结束touch过程
            // touchcancel与touchend类似，
            // 不同的是touchcancel是因为系统系统弹框等原因结束touch过程
            // touchend是用户主动结束touch过程（手指离开触摸屏）
            touchcancel: touchend
        })
    }

    function ScrollBar(option) {
        this.scrollBarColor = option.scrollBarColor || '#afafaf'
        this.allowSlideDown = option.allowSlideDown || false
        this.slideDownRatio = 0.35
        this.translateY = option.scrollTop || 0
        var thisObj = this
        var nameArr = ['wrapper', 'scroller']

        // 校验参数
        nameArr.forEach(function (item) {
            if (!item) throw new Error('Invalid argument: ' + item + '(property) cannot be empty')

            thisObj[item] = document.querySelector(option[item])
        })

        // 做一些初始化的工作
        this.init()
    }

    ScrollBar.prototype.init = function () {
        // 初始化样式
        insertStyleAndHtml(this)
        // 初始化touch事件
        initEvent(this)
    }

    ScrollBar.prototype.scrollTo = function (scrollTop, duration) {
        duration = duration || 0
        var els = [this.scroller, this.scrollBar]

        els.forEach(function (el) {
            insertStyle(el, {
                transition: 'transform ' + duration + 'ms',
            })

            el.addEventListener('transitionend', function fn() {
                el.style.transition = ''
                el.removeEventListener('transitionend', fn)
            })
        })

        setTranslateY(-scrollTop, this)
    }

    ScrollBar.prototype.refresh = function () {
        this.init()
    }

    return ScrollBar
})()