var data = [1,32,22,5,9,10,25,17,56,87,53];

var render = function(data){
	d3.select("#container")
		//没有这一行，就不能产生data1的div
		.append("div")
		.selectAll("div")
		.data(data)
		.enter()
		.append("div")
		.attr("class","box")
		.text(function(d){return d;});
	//作用在于使data1的div另起一行,清除原来的样式
	d3.select("#container")
		.append("div")
		.style({clear:"both"});
};

window.onload = function(){
	render(data);
	var scale = d3.scale.linear()
						.domain([0,d3.max(data)])
						.range([0,100]);
	//将data映射成data1
	var data1 = data.map(function(d){
		return scale(d).toFixed(2);
	});
	console.log(data1);
	render(data1);
}