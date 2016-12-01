var generator = function(){
	var data = [];
	for(var i=0; i<15; i++){
		data.push( d = []);
		d.x = Math.floor(Math.random()*600);
		d.y = Math.floor(Math.random()*600);
		d.value = Math.floor(Math.random()*50);
	}
	return data;
	};

window.onload = function(){
	var svgWidth = 1000;
	var svgHeight = 800;
	var svg = d3.select("body").append("svg")
							.attr({
								width: svgWidth,
								height: svgHeight
							});
	svg.selectAll("circle")
		.data(generator)
		.enter()
		.append("circle")
		.attr({
			cx: function(d,i){return d.x;},
			cy: function(d,i){return d.y;},
			r: function(d,i){return d.value;},
			fill: "#c3cbf0",
			"stroke": "orange",
		})
		.transition()
		.duration(3000)
		.attr({
			cx: function(d,i){return d.x + i * 10;},
			cy: function(d,i){return d.y + i * 10;},
			r: function(d,i){return d.value * 1.5;},
			fill: "teal",
			"stroke": "orange",
		});
};