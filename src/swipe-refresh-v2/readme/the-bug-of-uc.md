# UC浏览器的bug(该bug导致组件不能在UC上运行)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Title</title>
    <style type="text/css">
        html, body, div, p, ul, li, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
        }
        html, body {
            width: 100%;
            height: 100%;
            line-height: 1;
        }
        body * {
            box-sizing: border-box;
        }
        body {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        }
        #header {
            height: 60px;
            background: #00ff00;
        }
        #bd {
            flex: 1;
            background: #ff0000;
        }
        #footer {
        }
    </style>
</head>
<body>
<div id="header"></div>
<div id="bd" style="overflow: hidden">
    <div id="wrapper" style="height: 100%; overflow: auto">
        <div id="scroller" style="height: 2000px"></div>
    </div>

</div>
<div id="footer"></div>
</body>
<script>
    window.onload = function () {
        var $ = function () {
            return document.querySelector.apply(document, arguments);
        }
        console.log($)
        var bd = $('#bd');
        var wrapper = $('#wrapper');
        var scroller = $('#scroller');
        alert(bd.clientHeight + '---' + wrapper.clientHeight + '---' + scroller.clientHeight)
    }
</script>
</html>
```

1. 上面这个页面在一般浏览器上渲染后，应该是#bd和#wrapper的高度一样,#scroller为2000px,
这比#bd和#wrapper的高度要大，所以#wrapper出现滚动条。
但是UC这个奇葩，它上面却是#wrapper和#scroller的高度一样，都为2000px，这样#wrapper就不会出现滚动条
2. 目前因为该bug导致组件不能在UC上运行，决定放弃支持这垃圾UC(虽然改起来不难,只需将flex布局换成absolute布局就可以了)
3. 目前animation和keyframes在UC必须要加-webkit-前缀才能使用

