var SwipeRefresh = (function () {
    // 常数
    var constMap = {
        // 底部框过度效果的duration
        "durationOfBottomBoxTransition": 350,
        // 顶部框过度效果的duration
        "durationOfTopBoxTransition": 500,
        // 顶部框中的图片过度效果的duration
        "durationOfTopImgTransition": 350,
        // 刷新成功后，显示成功标志的时间间隔
        "intervalOfShowRefreshSucess": 500,
        // 数据已全部加载完成后，显示该提示信息
        "intervalOfShowLoadedAllData": 1500,
        // 信息已全部加载完成的提示语
        "loadedAllDataTip": "已全部加载!",
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
        topTipText: null
    };

    function initSwipeRefresh() {
        var swipeCore = this.swipeCore;

        swipeCore.on('touchstart', function () {
            console.log("-----------start---------");
            console.log("touchstart");
        });

        swipeCore.on('afterTouchStart', function (e) {
            console.log("afterTouchStart");
            console.log(e);
        });

        // 当滑动到tobBox部分显示出来时，
        // 修改提示语和隐藏图标
        swipeCore.on('showPartTop', function (e) {
            var duration = constMap.durationOfTopImgTransition;
            var topBoxHeight = e.topBox.clientHeight;

            // 确保在连续触发touchmove时只执行一次
            if (pMap.currState !== "showWholeTop") {
                pMap.currState = "showWholeTop";

                pMap.topTipText.textContent = constMap.beforeRefreshTip;
                setCss(pMap.topTipImg, {
                    "transition": "all " + duration + "ms",
                    "transform": "translate3d(0," + (-topBoxHeight) + "px,0)"
                });
            }
        });

        // 当滑动到tobBox全部显示出来时，
        // 修改提示语和显示图标
        swipeCore.on('showWholeTop', function () {
            var duration = constMap.durationOfTopImgTransition;

            // 确保在连续触发touchmove时只执行一次
            if (pMap.currState !== "showPartTop") {
                pMap.currState = "showPartTop";

                pMap.topTipText.textContent = constMap.startRefreshTip;
                setCss(pMap.topTipImg, {
                    "transition": "all " + duration + "ms",
                    "transform": "translate3d(0,0,0)"
                });
            }
        });

        // 当滑动底部时，
        // 修改底部的提示信息
        swipeCore.on('hitedBottom', function (e) {
            changeBottomBox(e, swipeCore);
        })

        // 滑动结束时
        swipeCore.on('moveEnd', function (e) {
            constMap.fnMap = constMap.fnMap || {
                    // 回弹到恰好显示整个topBox,同时刷新数据
                    showWholeTop: function () {
                        swipeCore.scrollTo(0, 350, function () {
                            pMap.topTipText.textContent = constMap.refreshingTip;
                            pMap.topTipImg.className = 'pull_load';

                            pMap.refreshData(e, function () {
                                // 刷新数据成功后,先显示一段时间成功标识,然后隐藏topBox
                                pMap.topTipImg.className = 'pull_success';
                                pMap.topTipText.textContent = constMap.refreshedTip;
                                setTimeout(function () {
                                    hideTopBox(e, swipeCore, function () {
                                        // 隐藏hideTop后，恢复滑动
                                        swipeCore.done();
                                    });
                                }, constMap.intervalOfShowRefreshSucess);
                            });
                        });
                    },
                    showPartTop: function () {
                        // 回弹到隐藏hideTop
                        hideTopBox(e, swipeCore, function () {
                            swipeCore.done();
                        });

                    },
                    inTheMiddle: function () {
                        swipeCore.done();
                    },
                    hitedBottom: function () {
                        if (pMap.isLoadedAllData) {
                            hideBottomBox(e, swipeCore, function () {
                                // 恢复滑动
                                swipeCore.done();
                            });
                        } else {
                            pMap.loadData(e, function () {
                                if (pMap.isLoadedAllData) {
                                    changeBottomBox(e, swipeCore);
                                }
                                // 加载数据成功后,如果所有数据已加载，则隐藏bottomBox
                                hideBottomBox(e, swipeCore, function () {
                                    // 隐藏bottomBox后，恢复滑动
                                    swipeCore.done();
                                });
                            });
                        }
                    }
                };

            var fn = constMap.fnMap[e.boundary];
            fn && fn();

            console.log("touchend");
            console.log("-----------end---------");
        });
    }

    // 隐藏顶部的提示框(无refresh)
    function hideTopBox(e, swipeCore, callback) {
        pMap.topTipImg.className = 'pull_down';

        swipeCore.scrollTo(
            e.topBoxHeight,
            constMap.durationOfTopBoxTransition,
            function () {
                callback && callback();
            }
        );
    }

    // 修改底部的提示效果
    function changeBottomBox(e, swipeCore) {
        e.bottomBox.firstElementChild.textContent = pMap.isLoadedAllData
            ? constMap.loadedAllDataTip
            : constMap.loadingTip;

        if (e.bottomBox.style.display === 'none') {
            e.bottomBox.style.display = '';
            swipeCore.refresh();
            swipeCore.scrollTo(-e.slideUpThreshold, constMap.durationOfBottomBoxTransition);
        }
    }

    // 隐藏底部的提示框（有refresh）
    function hideBottomBox(e, swipeCore, callback) {
        if (pMap.isLoadedAllData) {
            setTimeout(fn, constMap.intervalOfShowLoadedAllData);
        } else {
            e.bottomBox.style.display = 'none';
            swipeCore.refresh();
            callback && callback();
        }

        function fn() {
            e.bottomBox.style.display = 'none';
            swipeCore.refresh();
            swipeCore.scrollTo(
                -e.slideUpThreshold,
                constMap.durationOfBottomBoxTransition,
                function () {
                    callback && callback();
                }
            );
        }
    }

    return createClass(
        // constructor
        function (option) {
            extendObj(option, {
                onAfterInit: function (e) {
                    var els = e.topBox.children;
                    var topBoxHeight = e.topBox.clientHeight;

                    pMap.topTipImg = els[0];
                    pMap.topTipText = els[1];

                    setCss(pMap.topTipImg, {
                        "transform": "translate3d(0," + (-topBoxHeight) + "px,0)"
                    })

                    e.bottomBox.style.display = 'none';
                }
            })
            this.swipeCore = new SwipeCore(option);

            pMap.refreshData = function (e, callback) {
                // 是刷新数据的时间最少为1s
                // 让callback在数据刷新成功后执行，
                // 同时确保callback的等待时间至少为1000ms
                executeAfter(function (done) {
                    option.refreshData.call(e, function () {
                        done();
                    })
                }, callback, 1000);

            };

            pMap.loadData = function (e, callback) {
                option.loadData.call(e, function (isLoadedAllData) {
                    pMap.isLoadedAllData = isLoadedAllData;
                    callback();
                });
            };

            // 初始化组件
            initSwipeRefresh.apply(this);
        },

        // instance props
        {},

        // static props
        {}
    );
})();
