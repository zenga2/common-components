### example:
```javascript
var swipeRefresh = new SwipeRefresh({
        wrapper: '#wrapper',
        scroller: '#scroller',
        topBox: '.top-tip-box',
        bottomBox: '.bottom-tip-box',
        initHeight: wrapperHeight,
        // 是否触发click
        click: false,
        refreshData: function (done) {
            getData(function(response) {
              // doSomething
              doSomething();
                
              // 数据刷新成功后必须调用done()
              done();
            });
        },
        loadData: function (done) {
            getData(function(response) {
              // doSomething
              doSomething();
                
              // 数据刷新成功后必须调用done()
              done();
            });
        }
    });
```