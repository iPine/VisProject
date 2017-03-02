function renderArcs(classes){

    var svg = d3.select("svg");

    var tip = d3.tip()
        .attr("class","d3-tip")
        .offset([-10,0])
        .html(function(d,i){
 //之前这里有个bug,当一个区间没有值时，i没有累加，导致空白后面的直方条的区间有问题  
 //现在直接调用d.key，会正常显示是第几个区间

            var start = 0.05*d.key;
            start = start.toFixed(2);
            var end = 0.05*(d.key+1);
            end = end.toFixed(2);
            return "<strong>Interval:</strong> <span style='color:#FCA66F'>" + '['+ start + ',' + end + ']' + "</span> </br> <strong>Numbers:</strong> <span style='color:#FCA66F'>" + d.value + "</span>";
          
        })

    svg.call(tip);

	 // classes.forEach(function(meta){

  //       meta.C1 = parseFloat(meta.C1)
  //       meta.C2 = parseFloat(meta.C2)
  //       meta.C3 = parseFloat(meta.C3)
  //       meta.C4 = parseFloat(meta.C4)

  //   })

	var PI = Math.PI;
    var arcMin = 102;        // inner radius of the first arc
    var arcWidth = 90;      // width
    var arcPad = 1;         // padding between arcs

    var classNum = d3.keys(classes[0]).length;
    var className = d3.keys(classes[0]);

    var eachAngle = 360 * (PI/180) / classNum;

    var drawArc = d3.svg.arc()
        .innerRadius(function(d, i) {
            return  arcMin + (arcWidth) + arcPad;
        })
        .outerRadius(function(d, i) {
            return arcMin;
        })
        .startAngle(function(d, i){

            return (i-1) * eachAngle;
        })
        .endAngle(function(d, i) {

            return (i) * eachAngle - 5 * (PI/180);
        });

    var newNum = [];

    for(var i=0; i<classNum; i++){
    	newNum.push(i+1);
    }


    // bind the data
    var arcs = svg.append("g").selectAll('.arcBound')
        .data(className)
        .enter()
        .append('path')
        .attr("transform", "translate(380,230)")
        .attr("class","arcs")

    // *** update existing arcs -- redraw them ***
    arcs.attr("d", drawArc)
        .attr("fill", '#F5F5DC')
        .attr('stroke','#ccc')
        .attr('stroke-width',2)



    var counter = 0;

    var histMin = 105;        // inner radius of the first arc
    var histWidth = arcWidth/20;      // width
    var histPad = 1;         // padding between arcs

    histAngle  = eachAngle - 5 * (PI/180);

    className.forEach(function(name){

        var max = 0;

        bucket = [];

        classes.forEach(function(d){

            meta = d[name];

            bucket.push(meta);
        })

        var prepReduceData = crossfilter(bucket);

        var reducedByArea = prepReduceData.dimension(function(d) { return parseInt(d * 100 / 5); }),
            reducedVolumeByArea = reducedByArea.group().reduceCount(),
            reducedData = reducedVolumeByArea.all();

        reducedData.forEach(function(dd){

            max = max > dd.value ? max : dd.value;
        })


        var drawHist = d3.svg.arc()
            .innerRadius(function(d, i) {
                return  histMin + d.key*(histWidth) + histPad;
            })
            .outerRadius(function(d, i) {
                return histMin + (d.key+1)*(histWidth);
            })
            .startAngle(function(d, i){

                return (counter) * eachAngle + (eachAngle - (d.value / max * eachAngle)) / 2;
            })
            .endAngle(function(d, i) {

                return (counter) * eachAngle + (d.value / max * eachAngle) + (eachAngle - (d.value / max * eachAngle)) / 2 - 5 * (PI/180);
            });

        // bind the dataa
        var hists = svg.append("g").selectAll('.hist')
            .data(reducedData)
            .enter()
            .append('path')
            .attr("transform", "translate(380,230)")
            .attr("class","hists")

        var maxValue = d3.max(reducedData,function(d){return d.value;});
        var linear = d3.scale.linear()
                            .domain([0,maxValue])
                            .range([0,1]);

        var a = d3.rgb(180,144,202);
        // var b = d3.rgb(94,231,223);
        var b =d3.rgb(51,161,131);

        var computeColor = d3.interpolate(a,b);

        // *** update existing arcs -- redraw them ***
        hists.attr("d", drawHist)
            // .attr("fill", 'steelblue')
            .attr("fill",function(d,i){
                var t = linear(i);
                    var color = computeColor(t);
                    return color.toString();
            })
            .attr('stroke','none')
            .on("mouseover",tip.show)
            .on("mouseout",tip.hide)

        // console.log(reducedData);
        // console.log(classes);

        counter += 1;

        //定义一个线性渐变
        var defs = svg.append("defs");

        var linearGradient = defs.append("linearGradient")
                                        .attr("id","linearColor")
                                        .attr({
                                            x1: "0%",
                                            y1: "0%",
                                            x2: "100%",
                                            y2: "0%"
                                        });
        var stop1 = linearGradient.append("stop")
                                    .attr("offset","0%")
                                    .style("stop-color",a.toString());
        var stop2 = linearGradient.append("stop")
                                    .attr("offset","100%")
                                    .style("stop-color",b.toString()); 

        //添加一个矩形，并应用线性渐变
        var colorRect = svg.append("rect")
                                    .attr({
                                        x: 20,
                                        y: 420,
                                        width: 140,
                                        height: 10
                                    })
                                    .style("fill","url(#"+ linearGradient.attr("id") +")"); 

        //添加一个标题
                svg.append("text")
                .text("membership degrees")
                .attr("x","90")
                .attr("y","400")
                .attr("font-size","8px")
                // .attr("font-weight","bold")
                .attr("text-anchor","middle")
                .attr("fill","gray");

                var minValueText = svg.append("text")
                                        .attr("class","valueText")
                                        .attr({
                                            x: 20,
                                            y: 420,
                                            dy: "-0.3em",
                                            fill: "gray"
                                        })
                                        .text(0);
                var maxValueText = svg.append("text")
                                        .attr("class","valueText")
                                        .attr({
                                            x: 160,
                                            y: 420,
                                            dy: "-0.3em",
                                            fill: "gray"
                                        })
                                        .text(1); 

        var scale = d3.scale.linear()
                        .domain([0,1])
                        .range([0,140]);

        var axis = d3.svg.axis()
                        .scale(scale)
                        .orient("bottom")
                        .ticks(5);

        svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(20,430)")
                .attr("fill","gray")
                .call(axis);
        

    })

}