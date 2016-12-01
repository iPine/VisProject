window.onload = function(){
	d3.selectAll(".box")
		.on("mousemove",function(d,i){
			var evt = d3.event;
			d3.select("#status1").text([evt.pageX,evt.pageY]);
		})
		.on("click",function(d,i){
			d3.select("#status2").html("box <b>" + i +"</b> is clicked!");
		})
};