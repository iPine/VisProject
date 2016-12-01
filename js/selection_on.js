window.onload = function(){
	d3.selectAll(".box")
		.on("click",function(d,i){
			d3.select("#status").html("").append("li")
				.html("box <b>" + i +"</b> is clicked!");
		})
		.on("click.second",function(d,i){
			d3.select("li").append("li")
				.html("box <b>" + i +"</b> is clicked again!");
		})
};