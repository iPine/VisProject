window.onload = function(){
	d3.select("body")
		.on("click",function(d,i){
			var xy1 = d3.mouse(document.querySelector("#o1"));
			var xy2 = d3.mouse(document.querySelector("#o2"));
			var xy3 = d3.mouse(document.querySelector("#o3"));
			d3.select("#status").text([xy1,xy2,xy3].join(" | "));
		})
};