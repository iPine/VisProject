
var data = [12,55,23,66,57,29,34,71,22];

window.onload = function(){
	// var len = data.length;

	// //获取容器DOM对象
	// var holder = document.querySelector("#barChart");

	// //创建len个div对象，并设置其属性
	// for(var i=0;i<len;i++){
	// 	//创建一个新DOM元素
	// 	var e = document.createElement("div");
	// 	e.setAttribute("class", "bar");
	// 	//设置元素宽度为对应数据值
	// 	e.style.width = data[i];
	// 	//设置元素的文本为对应数据值
	// 	e.innerText = data[i];
	// 	//向容器追加此DIV对象
	// 	holder.appendChild(e);
	// }
	var data = [12,55,23,66,57,29,34,71,22];
		var selection1 = d3.select("#barChart").selectAll("div");
		// console.log(selection1.size());
		d3.select("#debug").text("集合中元素数目：" + selection1.size());
		var selection2 = selection1.data(data);
		d3.select("#debug").append("div").text("集合中元素数据：" + selection2.size());
		var selection3 = selection2.enter();
		d3.select("#debug").append("div").text("集合中元素数据：" + selection3.size());
			selection3.append("div")
					.attr("class","bar")
					.text(function(d){return d;})
					.style("width",function(d,i){return d + "px";});
		
}