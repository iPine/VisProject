var data = [[10,10],[20,30],[50,20],[70,60],[90,20]];

var render = function(){
	var svg = d3.select("svg").attr({
		width: 500, height: 500
	});

	var area = d3.svg.area().y0(50);

	svg.append("g")
		.attr('transform', 'translate(' + 0 + ',' + 0 + ')scale(5)')
		.append("path")
		.attr("d",area(data))
		.style({fill: "teal", stroke: "green"});
};

window.onload = function(){
	render();
};