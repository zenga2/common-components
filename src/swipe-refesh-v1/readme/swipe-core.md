## swipe-core算法流程

### touchstart 
    - 获取初始状态值(如初始的pageY)
    
---

### touchmove
##### a. 滚动页面
    - 改变translateY的值
##### b. 做边界判断
    - 是否开始显示topBox，    即tlY>-TopH && tlY<0;
    - topBox是否全部显示出来, 即tlY>=0;
    - 是否到了底部           即tlY<=slideUpThreahold.
##### c. 计算滑动的速度
    - currV = calculateSpeed() 
    
---

### touchend
##### a. 惯性滑动
    - movefreely()
##### b. 滑动结束后做边界判断
    - 是否开始显示topBox，    即tlY>-TopH && tlY<0;
    - topBox是否全部显示出来, 即tlY>=0;
    - 是否到了底部           即tlY<=slideUpThreahold.

   
