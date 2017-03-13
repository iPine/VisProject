    function getValue(data){
        var num = [];
        
        for(var i=0; i<data.length; i++){
            var temp = [];
            var keys = d3.keys(data[i]);
            keys.forEach(function(key){

                temp.push(+data[i][key]);
            })
            num.push(temp);       
        } 
        return num; 
    }

    function disMatrix(data,dimension){
        var matrix = [];
        for (var i = 0; i < data.length; i++) {
                var tempArr =new Array(data.length);
                matrix.push(tempArr);
        }
        for(var i = 0; i < data.length; i ++) {
            for (var j = i; j < data.length; j ++) {
                matrix[i][j] = dis(data[i], data[j], dimension);
                matrix[j][i] = matrix[i][j];
            }
        }
            return matrix;

    }

    function dis(fromArr, toArr, diamention) {
        var dis = 0;
        for(var i = 0; i < diamention; i++) {
            dis += Math.pow((fromArr[i] - toArr[i]), 2);
        }
        dis = Math.sqrt(dis);
        return dis;
    }

    function mdsScatter(data,dimension){

      var padding = 5,
          height = 280;
      var width = 280;

      var svg;

        
        svg = d3.select("#MDS").append("svg").attr("width",width).attr("height",height).append('g').attr('transform', 'translate(' + 40 + ',' + 40 + ')')     
    
        
       

       

       var array = getValue(data);
       // console.log(array);
       var matrixData = disMatrix(array,dimension);

       // console.log(matrixData);
       var points_data = mds_classic(matrixData);

       // console.log(points_data);

        var min_x = d3.min(points_data, function(d) {
          return d[0];
        });

        var max_x = d3.max(points_data, function(d) {
          return d[0];
        });

        var min_y = d3.min(points_data, function(d) {
          return d[1];
        });

        var max_y = d3.max(points_data, function(d) {
          return d[1];
        });


        var xScale = d3.scale.linear().domain([min_x, max_x]).range([padding, width - 2 * padding - 40]);
        var yScale = d3.scale.linear().domain([min_y, max_y]).range([height - padding * 2 - 40, padding]);

        svg.selectAll('.point')
            .data(points_data)
            .enter()
            .append("circle")
            .attr("class","point")
            .attr({
                r: 3,
                cx: function(d) { return xScale(d[0]);},
                cy: function(d) { return yScale(d[1]);},
                fill: "#B490CA"
            })
    }

