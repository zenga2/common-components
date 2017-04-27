# common-components

### swipe-refresh-v1
    滑动的全部过程是基于touchmove获取位置(pageY)信息，然后通过translateY来滚动页面,
    同时手动借助requestanimationframe实现惯性滚动

### swipe-refresh-v2
    考虑到浏览器本身自带惯性滚动，所以修改为只对topBox的下拉和上滑采用touchmove和
    translateY，其他内容区的滚动采用原生的滚动(即此时unbind touchmove)。这样的话，
    性能和滚动的效果都会更好。
    注：该版本还有些问题待解决(例如微信上下拉会会触发原生的下拉效果),目前还没想到好的解决
    方法，留待以后解决。

### 开发进度
- [X] swipe-refresh-v1 下拉刷新上滑加载组件(原生JS实现第一版)
- [X] swipe-refresh-v2 下拉刷新上滑加载组件(原生JS实现第二版)
- [ ] swipe-refresh-with-plugin 下拉刷新上滑加载组件(基于第三方插件better-scroll开发)
- [ ] swipe-change-top-box  下滑时放大topBox的
- [ ] swipe-search  滑动搜索
