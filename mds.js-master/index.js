
// d3.csv('data/raw/iris-raw.csv',function(err,data){
   
//    var array = getValue(data);
//    var matrixData = disMatrix(array,4);

//    // console.table(matrixData);
   
// })

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

    function getValue(data){
        var num = [];
        
        for(var i=0; i<data.length; i++){
            var temp = [];
            var keys = d3.keys(data[i]);
            keys.forEach(function(key){

                temp.push(+data[i][key]);
                // console.log(num);
            })
            num.push(temp);       
        } 
        return num; 
    }

    function dis(fromArr, toArr, diamention) {
        var dis = 0;
        for(var i = 0; i < diamention; i++) {
            dis += Math.pow((fromArr[i] - toArr[i]), 2);
        }
        dis = Math.sqrt(dis);
        return dis;
    }

(function() {
  var MARGIN, enter_points, height, indicators, keys, links, links_data, m, max_x, max_y, min_x, min_y, points, points_data, svg, width, x, y;

  MARGIN = 100;

  svg = d3.select('svg');

  // width = svg.node().getBoundingClientRect().width;

  // height = svg.node().getBoundingClientRect().height;

  width = 960;
  height = 600;

  d3.csv("data/iris-raw.csv",function(err,data){

    var array = getValue(data);
    var matrixData = disMatrix(array,4);

    keys = ["Atlanta", "Chicago", "Denver", "Houston", "Los Angeles", "Miami", "New York", "San Francisco", "Seattle", "Washington, DC"];

    m = [[0, 587, 1212, 701, 1936, 604, 748, 2139, 2182, 543], [587, 0, 920, 940, 1745, 1188, 713, 1858, 1737, 597], [1212, 920, 0, 879, 831, 1726, 1631, 949, 1021, 1494], [701, 940, 879, 0, 1374, 968, 1420, 1645, 1891, 1220], [1936, 1745, 831, 1374, 0, 2339, 2451, 347, 959, 2300], [604, 1188, 1726, 968, 2339, 0, 1092, 2594, 2734, 923], [748, 713, 1631, 1420, 2451, 1092, 0, 2571, 2408, 205], [2139, 1858, 949, 1645, 347, 2594, 2571, 0, 678, 2442], [2182, 1737, 1021, 1891, 959, 2734, 2408, 678, 0, 2329], [543, 597, 1494, 1220, 2300, 923, 205, 2442, 2329, 0]];


    points_data = mds_classic(m);

    console.log(points_data);

    min_x = d3.min(points_data, function(d) {
      return d[0];
    });

    max_x = d3.max(points_data, function(d) {
      return d[0];
    });

    min_y = d3.min(points_data, function(d) {
      return d[1];
    });

    max_y = d3.max(points_data, function(d) {
      return d[1];
    });

    x = d3.scale.linear().domain([max_x, min_x]).range([MARGIN, width - MARGIN]);

    y = d3.scale.linear().domain([min_y, max_y]).range([MARGIN, height - MARGIN]);

    links_data = [];

    points_data.forEach(function(p1, i1) {
      var array;
      array = [];
      points_data.forEach(function(p2, i2) {
        if (i1 !== i2) {
          return array.push({
            source: p1,
            target: p2,
            dist: m[i1][i2]
          });
        }
      });
      return links_data = links_data.concat(array);
    });

    links = svg.selectAll('.link').data(links_data);

    links.enter().append('line').attr({
      "class": 'link',
      x1: function(d) {
        return x(d.source[0]);
      },
      y1: function(d) {
        return y(d.source[1]);
      },
      x2: function(d) {
        return x(d.target[0]);
      },
      y2: function(d) {
        return y(d.target[1]);
      }
    });

    points = svg.selectAll('.point').data(points_data);

    enter_points = points.enter().append('g').attr({
      "class": 'point',
      transform: function(d) {
        return "translate(" + (x(d[0])) + "," + (y(d[1])) + ")";
      }
    });

    enter_points.append('circle').attr({
      r: 1,
      opacity: 0.3
    });

    enter_points.append('circle').attr({
      r: 1
    });

    // enter_points.append('text').text(function(d, i) {
    //   return keys[i];
    // }).attr({
    //   y: 12,
    //   dy: '0.35em'
    // });

    // enter_points.append('title').text(function(d, i) {
    //   return d[0] + ", " + d[1];
    // });

    indicators = svg.selectAll('.indicator').data(links_data);

    indicators.enter().append('circle').attr({
      "class": 'indicator',
      r: 5,
      cx: function(d) {
        var mul;
        mul = d.dist / Math.sqrt(Math.pow(d.target[1] - d.source[1], 2) + Math.pow(d.target[0] - d.source[0], 2));
        return x(d.source[0]) + mul * (x(d.target[0]) - x(d.source[0]));
      },
      cy: function(d) {
        var mul;
        mul = d.dist / Math.sqrt(Math.pow(d.target[1] - d.source[1], 2) + Math.pow(d.target[0] - d.source[0], 2));
        return y(d.source[1]) + mul * (y(d.target[1]) - y(d.source[1]));
      }
    });

    enter_points.on('click', function(d) {
      links.classed('visible', function(l) {
        return l.source === d;
      });
      return indicators.classed('visible', function(l) {
        return l.source === d;
      });
    });

  });

}).call(this);