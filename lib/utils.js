var isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Function]'
    };

window.requestAnimationFrame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || function (fn) {
        setTimeout(fn, 1000 / 60);
    };

function each(obj, fn) {
    if (!obj || !fn) return;
    var i;
    var len;
    var keys;

    if (isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
            if (fn.call(obj, obj[i], i) === false) return;
        }
    } else {
        keys = Object.keys(obj);
        for (i = 0, len = keys.length; i < len; i++) {
            var k = keys[i];
            if (fn.call(obj, obj[k], k) === false) return;
        }
    }
}

// 扩展对象
function extend(targetObj, obj, isOverwrite) {
    isOverwrite = isOverwrite || true;
    var keys = Object.keys(obj);
    var len = keys.length;
    var key;
    var i;

    if (isOverwrite) {
        for (i = 0; i < len; i++) {
            key = keys[i];
            targetObj[key] = obj[key];
        }
    } else {
        for (i = 0; i < len; i++) {
            key = keys[i];
            if (!(key in targetObj)) {
                targetObj[key] = obj[key];
            }
        }
    }

    return targetObj;
}

// 把首字母转为大写
function firstLetterToUpperCase(str) {
    return str.replace(/^\w/, function (matchStr) {
        return matchStr.toUpperCase();
    })
}

// 创建类
function createClass(constructor, instanceProps, staticPros) {
    function ClassItem() {
        if (typeof constructor === 'function') {
            constructor.apply(this, arguments);
        }
    }
    // 静态属性
    extend(ClassItem, staticPros);
    // 实例属性
    extend(ClassItem.prototype, instanceProps);

    return ClassItem;
}

function setCss(el, styleObj) {
    if (!el) {
        throw new Error('invalid argument: el cannot be empty');
    } else if (typeof el === 'string') {
        el = document.querySelector(el);
    }

    var bodyStyleObj = document.body.style;

    each(styleObj, function (val, prop) {
        // 判断是否需要加前缀(这里针对的是移动端，所以只考虑webkit)
        var wProp = 'webkit' + firstLetterToUpperCase(prop);

        if (!(prop in bodyStyleObj) && (wProp in bodyStyleObj)) {
            prop = wProp;
        }

        el.style[prop] = val;
    })
}

// 让fn2在fn1执行完后执行,可以给fn1的执行时间设置一个最小时间间隔
function executeAfter(fn1, fn2, minInterval) {
    minInterval = minInterval || 0;
    var isDone = false;
    var isTimeout = false;

    setTimeout(function () {
        // fn1已经执行完了
        if (isDone) {
            fn2();
        } else {
            isTimeout = true;
        }

    }, minInterval);

    fn1(function () {
        if (isTimeout) {
            fn2();
        } else {
            isDone = true;
        }
    })
}

// 将日志显示在页面上
function log(msg, i) {
    var logEl = document.createElement('div');
    document.body.insertBefore(logEl, document.body.firstElementChild);
    logEl.style.borderBottom = '1px solid #c1c2c3';
    logEl.style.paddingTop = '10px';

    if (i) {
        localStorage.setItem('couter', i);
    }
    var couter = Number(localStorage.getItem('couter')) || 0;
    alert(couter);

    logEl.textContent = msg;
}

function bindEvent(el, type, fn) {
    if (typeof el === 'string') {
        el = document.querySelector(el);
    }

    el.addEventListener(type, fn);
}

function animation(workFn, duration) {
    var startTime = +(new Date);
    requestAnimationFrame(function step() {
        var currTime = +(new Date);
        workFn((currTime - startTime) / duration);
        if (currTime < duration) {
            requestAnimationFrame(step);
        }
    });
}

