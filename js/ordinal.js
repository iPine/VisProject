var data = ["China","USA","Russia","Japan","Cuba","Italy","Egypt","Mexico","Canada","India"];

var render = function(data){
	d3.select("#container")
		.append("div")
		.selectAll("div")
		.data(data)
		.enter()
		.append("div")
		.attr("class","box")
		.style("background",function(d){
			return d.match(/^#/)?d:"#ccc";
		})
		.text(function(d){return d;});
	d3.select("#container")
		.append("div")
		.style({clear:"both"});
};

window.onload = function(){
	render(data);
	var scale = d3.scale.ordinal()
						.domain(["China"])
						.range(["#f00","#0f0"]);
	var data1 = data.map(function(d){
		return scale(d);
	});
	render(data1);
};