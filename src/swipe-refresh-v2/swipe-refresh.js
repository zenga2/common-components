var SwipeRefresh = (function () {
    // 常数
    var constMap = {
        // 信息已全部加载完成的提示语
        "loadedAllDataTip": "没有更多了",
        // 信息正在加载中的提示语
        "loadingTip": "正在加载中...",
        // 顶部框还未全部下拉出来的提示语
        "beforeRefreshTip": "下拉刷新",
        // 顶部框已经全部下拉出来的提示语
        "startRefreshTip": "释放刷新",
        // 正在刷新的提示语
        "refreshingTip": "刷新中，请稍等...",
        // 刷新成功的提示语
        "refreshedTip": "刷新成功"
    };

    // 保存各种全局的参数
    var pMap = {
        // 是否已全部加载
        isLoadedAllData: false,
        // 标识当前滑动的状态
        currState: "",
        topTipImg: null,
        topTipText: null,
        bottomTipText: null
    };

    function initState(opts) {
        var data = this.swipeCore.pMap;
        ['wrapper', 'scroller', 'bottomBox', 'topBox'].forEach(function (prop) {
            pMap[prop] = data[prop];
        })

        pMap.refreshData = function (event, callback) {
            // 是刷新数据的时间最少为1s
            // 让callback在数据刷新成功后执行，
            // 同时确保callback的等待时间至少为2000ms
            executeAfter(function (done) {
                opts.refreshData.call(event, function () {
                    done();
                })
            }, callback, 2000);

        };

        pMap.loadData = function (event, callback) {
            opts.loadData.call(event, function (isLoadedAllData) {
                pMap.isLoadedAllData = isLoadedAllData;
                callback();
            });
        };

        var topBox = pMap.topBox;
        var els = topBox.children;
        var topBoxHeight = topBox.clientHeight;
        pMap.topTipImg = els[0];
        pMap.topTipText = els[1];
        setCss(pMap.topTipImg, {
            "transform": "translate3d(0," + (-topBoxHeight) + "px,0)"
        });

        pMap.bottomTipText = pMap.bottomBox.firstElementChild;
    }

    function initEvent() {
        var swipeCore = this.swipeCore;
        // 当滑动到tobBox部分显示出来时，
        // 修改提示语和隐藏图标
        swipeCore.on('showPartTop', function (event) {
            var topBoxHeight = event.topBox.clientHeight;

            // 确保在连续触发touchmove时只执行一次
            if (pMap.currState !== "showWholeTop") {
                pMap.currState = "showWholeTop";

                setCss(pMap.topTipImg, {
                    "transition": "all 350ms",
                    "transform": "translate3d(0," + (-topBoxHeight) + "px,0)"
                });
            }
        });

        // 当滑动到tobBox全部显示出来时，
        // 修改提示语和显示图标
        swipeCore.on('showWholeTop', function () {
            // 确保在连续触发touchmove时只执行一次
            if (pMap.currState !== "showPartTop") {
                pMap.currState = "showPartTop";

                pMap.topTipText.textContent = constMap.startRefreshTip;
                setCss(pMap.topTipImg, {
                    "transition": "all 350ms",
                    "transform": "translate3d(0,0,0)"
                });
            }
        });

        // 滑动结束时
        swipeCore.on('moveEnd', function (event) {
            constMap.fnMap = constMap.fnMap || {
                    // 回弹到恰好显示整个topBox,同时刷新数据
                    showWholeTop: function () {
                        pMap.topTipText.textContent = constMap.refreshingTip;
                        pMap.topTipImg.className = 'pull_load';
                        scrollTo(0, 350, function () {
                            pMap.refreshData(event, function () {
                                // 刷新数据成功后,先显示一段时间成功标识,然后隐藏topBox
                                pMap.topTipImg.className = 'pull_success';
                                pMap.topTipText.textContent = constMap.refreshedTip;

                                // 成功标识显示500ms
                                setTimeout(function () {
                                    hideTopBox(event.topBoxHeight);
                                }, 500);
                            });
                        });

                    },
                    showPartTop: function () {
                        // 回弹到隐藏hideTop
                        hideTopBox(event.topBoxHeight);

                    },
                    inTheMiddle: function () {},
                    hitBottom: function () {
                        pMap.loadData(event, function () {
                            changeBottomBox();
                        });
                    }
                };

            var fn = constMap.fnMap[event.boundary];
            fn && fn();
        });

        // only support scroll topBox
        function scrollTo(tlY, duration, callback) {
            setCss(pMap.scroller, {
                transition: 'all ' + duration + 'ms'
            });

            swipeCore.setTranslateY(tlY, true);

            setTimeout(function () {
                setCss(pMap.scroller, {transition: ''});
                callback && callback();
            }, duration);
        }

        // 隐藏顶部的提示框
        function hideTopBox(topBoxHeight, callback) {
            pMap.topTipImg.className = 'pull_down';

            scrollTo(
                -topBoxHeight,
                500,
                callback
            );
        }

        function changeBottomBox() {
            var arr = pMap.isLoadedAllData
                ? ['loaded', 'loading', constMap.loadedAllDataTip]
                : ['loading', 'loaded', constMap.loadingTip];

            pMap.bottomBox.classList.add(arr[0])
            pMap.bottomBox.classList.remove(arr[1])
            pMap.bottomTipText.textContent = arr[2];
        }
    }

    function constructor(opts) {
        this.swipeCore = new SwipeCore(opts);

        initState.call(this, opts);

        initEvent.call(this);
    }

    return createClass(
        //constructor
        constructor,
        // instance props
        {},
        // static
        {}
    );
})();