window.onload = function(){
	d3.selectAll("a")
		.attr("target","www.baidu.com")
		.attr("href",function(d,i){
			this.innerText = i;
			return "http://www.baidu.com/";
		})
};