var data=[50,30];
window.onload = function(){

	d3.selectAll(".ball")	//建立选择集
		.data(data)			//匹配数据集
		//修改匹配集中的DOM元素的文本内容和属性
		.text(function(d,i){return d;})
		//将字写在高度中间
		.style("line-height",function(d,i){return d+"px";})
		//将div设置成圆的方法是高度与宽度一样，且border-radius为其值一半，50%
		.style("width",function(d,i){return d+"px";})
		.style("height",function(d,i){return d+"px";});
};
