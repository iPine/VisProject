window.onload = function(){
	var selection1 = d3.selectAll("div");
	d3.select("#debug").append("li").text("selection1 size: " + selection1.size());
	var selection2 = selection1.data([22,33,66])
								.text(function(d){return d;});
	d3.select("#debug").append("li").text("插入新数据后selection2 size: " + selection2.size());
	var selection3 = selection2.style("background","orange");

};