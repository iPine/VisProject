window.onload = function(){

	d3.select(".ball")		//建立选择集
		.style({left:"50px",top:"50px",width:"20px",height:"20px"})
		.transition()		//建立转场对象
		.ease(function(t){return 1-t;})   //控制动画速度
		.duration(2000)		//设置2秒转场时间
		.tween("myTest",function(d,i){	//指定转场计算过程

			//获得当前DOM元素的开始宽度
			var start = this.offsetWidth;

			//返回tween函数，每17ms被调用1次
			return function(t){
				//每次变大一点点
				this.style.width = start + 100*t;
			}
		});
};