window.onload = function () {
    var swipeCore = new SwipeCore({
        wrapper: '#wrapper',
        scroller: '#scroller'
    });

    document.querySelector('.back').addEventListener('click', function () {
        history.back();
    });
};

