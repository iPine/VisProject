window.onload = function(){
	var selection1 = d3.selectAll("div").remove().text("呵呵");

	selection1.each(function(d,i){
		var e = this;//这里的this指的是selection1里的每个dom元素
		d3.select("body").append(function(d,i){
			return e;
		});
	})

};