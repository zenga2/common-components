<center>swipe-refresh算法流程</center>

---

###moveIn阶段
####下拉时
    1. >-topH && <0 时，显示"下拉刷新"
    2. >0 时, 显示“释放刷新”, 同时出现图标(use transition)   
####中间阶段
    3. doSomething
####上滑时
    4. 到底部时，显示底部
    
---
###moveEnd时
    1. >-topH && <0时, 回弹到-topH
    2. >0时, 先回弹到0, 同时显示文字"刷新中,请稍等..."和刷新图标
       然后refreshDate(), 最后当数据刷新成功后回弹到-topH
    3. 底部时，加载数据，成功后回弹; 如果所有数据都加载完成则隐藏
    
