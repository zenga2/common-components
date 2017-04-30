var SwipeRefresh = (function () {
    // 常数
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

    function moveIn(pos) {}

    function moveEnd() {
        var boundary = judgeBoundary(pMap.swipeCore.y);
        console.log(pMap.swipeCore.y)

        constMap.fnMap = constMap.fnMap || {
                // 回弹到恰好显示整个topBox,同时刷新数据
                showWholeTop: function () {
                    pMap.topTipText.textContent = constMap.refreshingTip;
                    pMap.topTipImg.className = 'pull_load';
                    pMap.refreshData(function () {
                        // 刷新数据成功后,先显示一段时间成功标识,然后隐藏topBox
                        pMap.topTipImg.className = 'pull_success';
                        pMap.topTipText.textContent = constMap.refreshedTip;

                        // 成功标识显示500ms
                        setTimeout(function () {
                            hideTopBox();
                        }, 500);
                    });
                },
                showPartTop: function () {
                    // 回弹到隐藏hideTop
                    hideTopBox();

                },
                inTheMiddle: function () {},
                hitBottom: function () {
                    pMap.loadData(function () {
                        changeBottomBox();
                    });
                }
            };

        var fn = constMap.fnMap[boundary];
        fn && fn();
    }

    // 判断边界
    function judgeBoundary(translateY) {
        var boundary = "";
        var slideUpThreshold = pMap.swipeCore.maxScrollY + 10;

        // 整个topBox显示出来
        if (translateY >= 0) {
            boundary = 'showWholeTop';
        }
        // topBox显示了一部分
        else if (translateY > -pMap.topBoxHeight) {
            boundary = 'showPartTop';
        }
        // 中间一般滑动过程
        else if (translateY > slideUpThreshold) {
            boundary = 'inTheMiddle';
        }
        // 到了底部
        else if (translateY <= slideUpThreshold) {
            boundary = 'hitBottom';
        }

        return boundary;
    }

    // 隐藏顶部的提示框
    function hideTopBox(callback) {
        pMap.topTipImg.className = 'pull_down';

        scrollTo(
            -pMap.topBoxHeight,
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

    function scrollTo(y, duration, callback) {
        console.log(y)
        pMap.swipeCore.scrollTo(0, y, duration);
        setTimeout(callback, duration);
    }

    function constructor(opts) {
        extendObj(pMap, opts);

        ['wrapper', 'scroller', 'topBox', 'bottomBox'].forEach(function (prop) {
            var val = pMap[prop];
            if (!val) throw new Error('Invalid argument: ' + prop + ' cannot be empty');

            pMap[prop] = document.querySelector(val);
        });

        this.pMap = Object.create(pMap);

        init.call(this, opts);
    }

    function init(opts) {
        var topBox = pMap.topBox;
        var els = topBox.children;
        var event = Object.create(pMap);

        pMap.topTipImg = els[0];
        pMap.topTipText = els[1];
        pMap.bottomTipText = pMap.bottomBox.firstElementChild;
        pMap.topBoxHeight = topBox.clientHeight;

        pMap.refreshData = function (callback) {
            // 让callback在数据刷新成功后执行，
            // 同时确保callback的等待时间至少为2000ms
            executeAfter(function (done) {
                opts.refreshData.call(event, function () {
                    pMap.swipeCore.refresh();

                    done();
                });
            }, callback, 2000);

        };

        pMap.loadData = function (callback) {
            opts.loadData.call(event, function (isLoadedAllData) {
                pMap.swipeCore.refresh();

                pMap.isLoadedAllData = isLoadedAllData;
                callback && callback();
            });
        };

        pMap.swipeCore = new BScroll(pMap.wrapper, {
            startY: -pMap.topBoxHeight,
            probeType: 3
        });
        pMap.swipeCore.on('scroll', moveIn);
        pMap.swipeCore.on('scrollEnd', moveEnd);
    }

    return createClass(
        // constructor
        constructor,
        // instance props
        {},
        // static props
        {}
    );
})();