var data=(function(){
	var data = [];
	for(var i=1; i<11; i++){
		data.push(new Date(2014,3,i));
	}
	return data;
})();

var render = function(data){
	d3.select("#container")
		.append("div")
		.selectAll("div")
		.data(data)
		.enter()
		.append("div")
		.attr('class',"box")
		.text(function(d){
			return typeof d === "object"? d3.time.format("%m-%d")(d):d;
		});
	d3.select("#container")
		.append("div")
		.style('clear', 'both');
};

window.onload = function(){
	render(data);
	var scale = d3.time.scale()
						.domain([new Date("2014-4-1"), new Date("2014-4-10")])
						.range([30,100]);
	var data1 = data.map(function(d){
		return scale(d).toFixed(2);
	});
	render(data1);
};