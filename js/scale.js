var generator = function(){
	var data = [];
	for(var i=0; i<200; i++){
		data.push(d = []);
		d.hour = i;
		//toFixed(2)指定保留两位小数四舍五入
		d.bbt =37 + Math.random().toFixed(2)*Math.pow(-1,i%2);
	}
	return data;
};
//将样本温度数据范围从36-38变到0-300
var myScale = function(d){
	return (d-36)*(300-0)/(38-36);
}
var render = function(){
	var svg = d3.select("svg").attr({width: 500, height: 400});
	svg.append("rect")
		.attr({
			x: 0,
			y: 0,
			width: 500,
			height: 400,
			fill: "#f0f0f0",
			stroke: "#000"
		});
var line = d3.svg.line()
				.x(function(d){return d.hour;})
				.y(function(d){return myScale(d.bbt);});
	svg.append("path")
		//这里传入的必须是generator这个函数
		.attr("d",line(generator()))
		.style({fill: "none", stroke: "blue"});
};

window.onload = function(){
	render();
};