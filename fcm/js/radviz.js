//首先为模块定义别名
requirejs.config({
	paths:{
		"d3": "lib/d3.min",
		"radviz": "js/radviz",
	}
});
//然后用requirejs方法引入radviz模块实现需求
define(["d3"],function(d3){
	var main = function(config){
		this.dom =  config.dom;
		this.inputData = config.data;
		this.dimOrder = config.dimOrder;
		this.positionConf = config.positionConf;

		this._init();
	};

	main.prototype = {
		//初始化函数
		_init: function(){
			//获取样本数
			this.dataSize = this.inputData.length;
			//获取维度数，即聚类数
			this.dimSize = this.dimOrder.length;
			//获取维度锚点排布序列
			this.orderData = [];
			for(var i=0; i<this.dataSize;i++){
				var line = [];
				for(var j=0; j<dimSize; j++){
					line[j] = this.inputData[i][this.dimOrder.[j]-1];
				}
				this.orderData[i]=line;
			}
			//计算维度锚点位置
			this.dimPoint = this._getDimPosition();
			//计算数据点位置
			this.dataPoint = this._getDataPosition();
			//计算聚类大小
			var clusters = this._getClusterSize();
			this.clusterSize = clusters.clusterSize;
		},
		//展示radviz的函数，根据dimOrder和orderData绘制
		render: function(){
			var self = this;
			var centerX = self.positionConf.centerX;
			var centerY = self.positionConf.centerY;
			var r = self.positionConf.r;
			var outerRadius = self.positionConf.outerRadius;
			var innerRadius = self.positionConf.innerRadius;
			var margin = 30;
			//创建svg
			var svg = d3.select(self.dom)
						.append("svg")
						.attr({
							width: outerRadius * 2 + margin * 4,
							height: outerRadius * 2 + margin * 4
						});
			self.svg = svg;
			//绘制弧度
			var dimData = [];
			for(var i=0; i< self.dimSize; i++){
				dimData[i] = 1;
			}
			//饼图构造器
			var pie = d3.layout.pie();
			var arcBeginEnd = [];

			var arc = d3.svg.arc()
				.startAngle(function(d,i){
						var r;
                    if (j === 0) {
                        var prior = self.radiusArr[self.dimSize - 1];
                        r = prior + (Math.PI * 2 - prior) / 2 + Math.PI * 0.5 - Math.PI * 2;
                    } else {
                        r = 0.5 * Math.PI + self.radiusArr[j] - (self.radiusArr[j] - self.radiusArr[j - 1]) / 2;
                    }
                    arcBeginEnd[j] = {
                        begin: r
                    };
                    return r;
                }).endAngle(function(d, j) {
                    if (j == (self.dimSize - 1)) {
                        r = 0.5 * Math.PI + self.radiusArr[j] + (Math.PI * 2 - self.radiusArr[j]) / 2;
                    } else {
                        r = 0.5 * Math.PI + self.radiusArr[j] + (self.radiusArr[j + 1] - self.radiusArr[j]) / 2;
                    }
                    arcBeginEnd[j].end = r;
                    return r;
                }).innerRadius(function(dh, i) {
                    return innerRadius - Math.sqrt(self.clusterWeight[i].size)
                })
                .outerRadius(function(d, i) {
                    return innerRadius + Math.sqrt(self.clusterWeight[i].size)
                });
                self.arcBeginEnd = arcBeginEnd;

                var arcs = svg.selectAll('g.arc')
                .data(pie(dimData))
                .enter()
                .append('g')
                .attr('class', 'arc')
                .attr('id', function(d, i) {
                    return 'arc' + i;
                })
                .attr('transform', 'translate(' + centerX + ',' + centerY + ')');
               var anchorColor = this.anchorColor;
               var arcsObj = arcs.append("path")
                .attr("fill", function(d, i) {
                    return anchorColor(i);
                })
                .attr('fill-opacity', 1)
                .attr("d", arc)
                .style('cursor', 'pointer');
		}		

	}
});