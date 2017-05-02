var SwipeSearch = (function () {
    function start(event) {
        var touches = event.changedTouches;
        if (touches && touches.length > 0) {
            // 字母列表的第一个字母
            var firstLetter = this.allLetters[0];
            // 每个字母所在元素的高度
            this.letterItemHeight = firstLetter.clientHeight;
            // 第一个字母的视口坐标
            this.firstLetterTop = firstLetter.getBoundingClientRect().top;
            // 第一个锚元素的相对于包含块的垂直偏移量
            this.firstAnchorElTop = this.anchorEls[0].offsetTop;

            this.currY = this.startY = touches[0].clientY;
            this.lastLetter = this.currLetter = '';
            this.lastIndex = this.currIndex = -1;
            this.getCurrentLetter();
            this.scrollToEl();

            // 给字母列表增加半透明的背景色
            this.toggleClassOfLetterList(true);
            // 显示字母显示框
            this.toggleLetterDisplayBox(true);
            // 填充当前的字母
            this.changeCurrDisplayLetter();

        }

        event.preventDefault();
    }

    function move(event) {
        var touches = event.changedTouches;
        if (touches && touches.length) {
            this.currY = touches[0].clientY;
            // 计算当前的字母
            this.getCurrentLetter();

            // 只在字母改变时滚动
            if (this.lastLetter !== this.currLetter) {
                this.changeCurrDisplayLetter();
                // 将字母对应的列表滚动到屏幕最顶端
                this.scrollToEl();
            }
        }

        event.preventDefault();
    }

    function end(event) {
        // 去掉字母列表的半透明背景色
        this.toggleClassOfLetterList(false);
        // 隐藏字母显示框
        this.toggleLetterDisplayBox(false);

        event.preventDefault();
    }

    // 获取当前手指滑到的字母
    function getCurrentLetter() {
        this.lastIndex = this.currIndex;
        this.lastLetter = this.currLetter;

        var dis = this.currY - this.firstLetterTop;
        var len = this.allLetters.length;
        var currIndex = Math.floor(dis / this.letterItemHeight);
        // 防止越界
        this.currIndex = currIndex >= len
            ? len - 1
            : (currIndex < 0 ? 0 : currIndex);

        this.currLetter = this.allLetters[this.currIndex].firstElementChild.textContent;

        return this.currLetter;
    }

    // 将数据列表中与当前字母对应的锚元素，滚动到屏幕最顶端(尽最大可能)
    function scrollToEl() {
        var id = 'anchor_' + this.currLetter;
        var anchorEl = document.getElementById(id);
        if (anchorEl) {
            var currAnchorElTop = document.getElementById(id).offsetTop;
            this.dataWrapper.scrollTop = currAnchorElTop - this.firstAnchorElTop;
        }
    }

    // 将字母显示框中的字母设置为当前字母
    function changeCurrDisplayLetter() {
        this.letterDisplayBox.textContent = this.currLetter;
    }

    // 切换字母显示框的显示状态
    function toggleLetterDisplayBox(flag) {
        setCss(this.letterDisplayBox, {display: flag ? '' : 'none'});
    }

    // 切换字母列表的样式
    function toggleClassOfLetterList(flag) {
        var method = flag ? 'add' : 'remove';
        this.wrapper.classList[method]('on');
    }

    function initState() {
        var self = this;
        ['wrapper', 'dataWrapper', 'letterDisplayBox'].forEach(function (prop) {
            var val = self[prop];
            if (typeof val === 'string') {
                self[prop] = document.querySelector(val);
            }
        });

        var wrapper = this.wrapper;
        this.scroller = this.wrapper.children[0];
        this.allLetters = this.scroller.children;
        this.anchorEls = this.dataWrapper.querySelectorAll(this.anchorSelector);

        // bind events
        this.scroller.addEventListener('touchstart', start.bind(this));
        this.scroller.addEventListener('touchmove', move.bind(this));
        this.scroller.addEventListener('touchend', end.bind(this));
    }

    return createClass(
        // constructor
        function (opts) {
            extend(this, opts);
            initState.call(this);
        },
        // instance props
        {
            getCurrentLetter: getCurrentLetter,
            scrollToEl: scrollToEl,
            changeCurrDisplayLetter: changeCurrDisplayLetter,
            toggleLetterDisplayBox: toggleLetterDisplayBox,
            toggleClassOfLetterList: toggleClassOfLetterList
        },
        // static props
        {}
    );
})();
