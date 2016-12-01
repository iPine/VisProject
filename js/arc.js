var data = [	
	{course:"Math",enroll:320},
	{course:"Chinese",enroll:401},
	{course:"English",enroll:1093},
	{course:"Music",enroll:781}
];
//数据预处理，计算每个数据对象的累计值
data.forEach(function(d,i,a){
	d.accum = 0;
	for(var j=0; j<i; j++){
		d.accum = d.accum + a[j].enroll;
	}
});
//数据预处理，计算单位弧度
var delta = 2*Math.PI/data.reduce(function(x,d){
	return x + d.enroll;},0);
//预设颜色
var clrs = d3.scale.category10();
var render = function(){
	var svg = d3.select("svg").attr({
		width: 500, height: 500
	});
	var arc =  d3.svg.arc()
					.startAngle(function(d){return d.accum * delta;})
					.endAngle(function(d){return (d.accum+d.enroll)*delta;})
					.innerRadius(0)
					.outerRadius(150);
	var arcs = svg.selectAll("g")
				.data(data)
				.enter()
				.append("g")
				.attr('transform', 'translate(' + 200 + ',' + 200 + ')')
			
	arcs.append("path")
		//将每个数据使用构造器转换为d属性
		.attr('d',function(d){return arc(d);})
		.style("fill",function(d,i){return clrs(i);});

	arcs.append("text")
		.attr('transform', function(d){return "translate(" + arc.centroid(d) + ")";})
		.attr({
				"text-anchor": "middle"
		})
		.text(function(d){return d.course;});;
};

window.onload = function(){
	render();
};