# common-components

### swipe-refresh-v1
    滑动的全部过程是基于touchmove获取位置(pageY)信息，然后通过translateY来滚动页面,
    同时手动借助requestanimationframe实现惯性滚动
    todo：这个的组件的惯性滑动效果不好，需要改进

### swipe-refresh-v2
    考虑到浏览器本身自带惯性滚动，所以修改为只对topBox的下拉和上滑采用touchmove和
    translateY，其他内容区的滚动采用原生的滚动(即此时unbind touchmove)。这样的话，
    性能和滚动的效果都会更好。
    todo：还有些问题待解决(例如微信上下拉会触发原生的下拉效果),目前还没想到好的解决方法，
        留待以后解决。

### swipe-refresh-with-plugin
    这个是基于better-scroll(类似iscroll的滑动插件)实现的下拉刷新上滑加载组件
    
### swipe-change-top-box-v1
    下拉时在顶部空出来的地方填充相同的背景色(与topBox相同)，回弹时反之
    
### swipe-change-top-box-v2
    下拉时放大topBox，回弹时再相应地缩小
    todo: 目前实现还有瑕疵，缩放时页面会抖动,留待以后解决
    
### swipe-search
    滑动右边的首字母列表，快速滚动到相应的数据项

### 开发进度
- [x] swipe-refresh-v1 下拉刷新上滑加载组件(原生JS实现第一版)
- [x] swipe-refresh-v2 下拉刷新上滑加载组件(原生JS实现第二版)
- [x] swipe-refresh-with-plugin 下拉刷新上滑加载组件(基于第三方插件better-scroll开发)
- [x] swipe-change-top-box-v1  下滑时填充相同的背景色
- [x] swipe-change-top-box-v2  下滑时放大topBox的
- [x] swipe-search  滑动搜索


## 查看DEMO

首先，clone项目源码
```
https://github.com/zenga2/common-components.git
```

安装依赖
```
cd common-components
npm install
```

测试demo页
```
npm run dev
```

打开浏览器访问如下地址, 查看效果
> localhost:8000