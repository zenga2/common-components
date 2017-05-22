window.onload = function () {
    var topBox = document.querySelector('.profit-wrapper');
    var topBoxH = topBox.clientHeight;
    var cloneNode = topBox.cloneNode(true);
    setCss(cloneNode, {
        display: 'none',
        position: 'fixed',
        top: '44px',
        left: '0',
        width: '100%',
        transform: 'scale(1,1)',
        transformOrigin: 'top center'
    });

    document.querySelector('.content').appendChild(cloneNode);

    var isHidden = true;
    var swipeCore = new SwipeCore({
        wrapper: '#wrapper',
        scroller: '#scroller',
        scroll: scroll,
        rebound: rebound
    });

    function scroll(pMap) {
        var tlY = pMap.translateY;
        var ratio = 1 + tlY / topBoxH;
        if (tlY > 0) {
            if (isHidden) {
                setCss(cloneNode, {display: ''})
                isHidden = false;
            }

            setCss(cloneNode, {
                transform: 'scale(' + ratio + ',' + ratio + ')'
            })
        }
    }

    function rebound(pMap) {
        setCss(pMap.scroller, {
            transition: 'all 350ms'
        });

        setCss(cloneNode, {
            transition: 'all 350ms',
            transform: 'scale(1,1)'
        })

        pMap.setTranslateY(0);

        setTimeout(function () {
            setCss(pMap.scroller, {transition: ''});
            setCss(cloneNode, {display: 'none', transition: ''})
            isHidden = true;
        }, 350);
    }

    document.querySelector('.back').addEventListener('click', function () {
        history.back();
    });
};

