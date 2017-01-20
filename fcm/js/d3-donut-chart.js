var DonutChart = function(selector, data, config) {
  if(!selector){
    throw 'Please provide a selector';
  }
  var _donutChart = this;
 
  var settings = (function() {
     var defaults = {
      width: 450,
      height: 300,
  
      radius: 100,
      innerRadius: 70,
      strokeColor: "#FFF",
      strokeWidth: 5,
  
      enableLabels: true,
      labelGroupOffset: 20,
      labelColor: "#333",
  
      // labelValueText: function(arc) {
      //   return Math.floor((arc.value / _donutChart.totals) * 100) + "%";
      // },
      // labelValueOffset: 16, // from label-group
  
      labelNameText: function(arc) {
        return arc.name + " (" + arc.value +")";
      },
      labelNameOffset: 0, // from label-group
  
      tickColor: "#333",
      tickWidth: 1,
      tickOffset: [0,0,2,8], // [x1, x2, y1, y2]
  
      easeFunction: 'cubic',
      animationDuration: 250,
      colors: d3.scale.category20()
     };

    for(var item in config) {
      defaults[item] = config[item];
    }
    return defaults;
  })();
  this.currentData = [];
  this.oldData = [];
  
  // ** Animation Functions ** //
  var calculateAngles = function(start, end) {
    var _this = this,
        interpolate = d3.interpolate({
        startAngle: start,
        endAngle: end
      }, {
        startAngle: _this.startAngle,
        endAngle: _this.endAngle
      });

    return function(t) {
      var b = interpolate(t);
      return arc(b);
    };
  },

  chartTween = function(d, i) {
    var start = 0, end = 0, oldData = _donutChart.oldData;

    if(oldData[i]) {
      start = oldData[i].startAngle;
      end = oldData[i].endAngle;
    } else if(!(oldData[i]) && oldData[i - 1]) {
      start = oldData[i - 1].endAngle;
      end = oldData[i - 1].endAngle;
    } else if(!(oldData[i - 1]) && oldData.length > 0) {
      start = oldData[oldData.length - 1].endAngle;
      end = oldData[oldData.length - 1].endAngle;
    }

    return calculateAngles.call(d, start, end);
  },

  removeChartTween = function(d) {
    var start = 2 * Math.PI,
        end = 2 * Math.PI;

    return calculateAngles.call(d, start, end);
  },

  textTween = function(d, i) {
    var a = 0, b, fn, oldData = _donutChart.oldData;

    if(oldData[i]) {
      a = (oldData[i].startAngle + oldData[i].endAngle - Math.PI) / 2;
    } else if(!(oldData[i]) && oldData[i - 1]) {
      a = (oldData[i - 1].startAngle + oldData[i - 1].endAngle - Math.PI) / 2;
    } else if(!(oldData[i - 1]) && oldData.length > 0) {
      a = (oldData[oldData.length - 1].startAngle + oldData[oldData.length - 1].endAngle - Math.PI) / 2;
    }

    b = (d.startAngle + d.endAngle - Math.PI) / 2;

    fn = d3.interpolateNumber(a, b);

    return function(t) {
      var val = fn(t);
      return "translate(" + Math.cos(val) * (settings.radius + settings.labelGroupOffset) + "," +
                            Math.sin(val) * (settings.radius + settings.labelGroupOffset) + ")";
    };
  },

  positionLabels = function(offset) {
    var _position = function() {
      this.attr("dy", function(d) {
          return offset;
        })
        .attr("text-anchor", function(d) {
          if((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
          } else {
            return "end";
          }
        });
    };
    _position.call(this);

    this.enter()
      .append("svg:text")
      .attr("fill", settings.labelColor)
      .attr("transform", function(d) {
        return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (settings.radius + settings.labelGroupOffset) + "," +
                              Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (settings.radius + settings.labelGroupOffset) + ")";
      });
    _position.call(this);

    this.transition()
      .ease(settings.easeFunction)
      .duration(settings.animationDuration)
      .attrTween("transform", textTween);

    this.exit().remove();

    return this;
  },

  // wrap d3 natives with the data paramaters
  donut = d3.layout.pie().value(function(data) { return data[1]; }),
  
  arc = d3.svg.arc()
    .startAngle(function(d) {
      return d.startAngle;
    })
    .endAngle(function(d) {
      return d.endAngle;
    })
    .innerRadius(settings.innerRadius)
    .outerRadius(settings.radius),

  // ** Display Functions ** //

  // chart container
  chart = d3.select(selector).append("svg:svg")
    .attr("class", "donut-chart")
    .attr("width", settings.width)
    .attr("height", settings.height),

  // paths
  path_group = chart.append("svg:g")
    .attr("class", "path-group")
    .attr("transform", "translate(" + (settings.width / 2) + "," + (settings.height / 2) + ")"),

  // labels
  label_group = chart.append("svg:g")
    .attr("class", "label-group")
    .attr("transform", "translate(" + (settings.width / 2) + "," + (settings.height / 2) + ")");

  // public update method
  this.update = function(newData) {
    _donutChart.totals = 0;
    var paths, lines, valueLabels, nameLabels,
    
      filterData = function(element, index, array) {
        element.name = newData[index][0];
        element.value = newData[index][1];
        _donutChart.totals += element.value;
        return element.value > 0;
      };

      this.oldData = this.currentData;
      this.currentData = donut(newData).filter(filterData);

    if(this.currentData.length > 0) {
      var currentData = this.currentData;
      // draw arcs
      paths = path_group.selectAll("path").data(currentData);

      paths.enter()
        .append("svg:path")
        .attr("stroke", settings.strokeColor)
        .attr("stroke-width", settings.strokeWidth)
        .attr("fill", function(d, i) {
          return settings.colors(i);
        })
        .transition()
        .ease(settings.easeFunction)
        .duration(settings.animationDuration)
        .attrTween("d", chartTween);

      paths.transition()
        .ease(settings.easeFunction)
        .duration(settings.animationDuration)
        .attrTween("d", chartTween);

      paths.exit()
        .transition()
        .ease(settings.easeFunction)
        .duration(settings.animationDuration)
        .attrTween("d", removeChartTween)
        .remove();

      if(settings.enableLabels) {
        // draw tick marks 
        lines = label_group.selectAll("line").data(currentData);

        lines.enter()
          .append("svg:line")
          .attr("x1", settings.tickOffset[0])
          .attr("x2", settings.tickOffset[1])
          .attr("y1", -settings.radius - settings.tickOffset[2])
          .attr("y2", -settings.radius - settings.tickOffset[3])
          .attr("stroke", settings.tickColor)
          .attr("stroke-width", settings.tickWidth)
          .attr("transform", function(d) {
            return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
          });

        lines.transition()
          .ease(settings.easeFunction)
          .duration(settings.animationDuration)
          .attr("transform", function(d) {
            return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
          });

        lines.exit().remove();

        // draw labels names
        nameLabels = label_group.selectAll("text.name").data(currentData);

        positionLabels.call(nameLabels, settings.labelNameOffset)
          .attr("class", "name")
          .text(settings.labelNameText);

        // draw label values
        // valueLabels = label_group.selectAll("text.value").data(currentData);

        // positionLabels.call(valueLabels, settings.labelValueOffset)
        //   .attr("class", "value")
        //   .text(settings.labelValueText);   
      }
        return this;
    
    } else {
      throw 'No usable data';
    }
  };

  if(data){
    this.update(data);
  }
};