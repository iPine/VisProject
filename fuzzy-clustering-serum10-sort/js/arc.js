function renderArcs(classes,flag){

    var svg = d3.select("svg");

    var tip = d3.tip()
        .attr("class","d3-tip")
        .offset([-10,0])
        .html(function(d,i){
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
    var arcMin = 112;        // inner radius of the first arc
    var arcWidth = 100;      // width
    var arcPad = 1;         // padding between arcs

    var order = [];
    
    // var flag = 0;//是否对锚点排序

    var classNum = d3.keys(classes[0]).length;

        if(flag){
            if(classNum == 10){order = [3, 4, 1, 10, 9, 8, 7, 6, 5, 2];}
            if(classNum == 7){order = [3, 1, 5, 7, 4, 2, 6];}
            if(classNum == 8){order = [6, 2, 1, 4, 3, 7, 8, 5];}
            if(classNum == 9){order = [3, 2, 1, 6, 8, 5, 7, 4, 9];}
            if(classNum == 11){order = [5, 3, 1, 9, 2, 10, 4, 7, 6, 8, 11];}
            
        }
        else{
            if(classNum == 10){order = [9,10,1,2,3,4,5,6,7,8];}
            if(classNum == 7){order = [7,1,2,3,4,5,6];}
            if(classNum == 8){order = [7,8,1,2,3,4,5,6];}
            if(classNum == 9){order = [8, 9, 1, 2, 3, 4, 5, 6, 7];}
            if(classNum == 11){order = [10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 9];}
            
            
            // order = [9,10,1,2,3,4,5,6,7,8];
        }

    // console.log(classNum);
    var className = dimensions(classNum,order);

    function dimensions(cNum,order){
         var dimensions = [];
         for(var i=0; i<cNum; i++){
            dimensions.push("C" + order[i]);
         }
         return dimensions;
    };

    var thetaScale = d3.scale.linear().domain([ 0, classNum ]).range([ 0, Math.PI * 2 ]);

    // var eachAngle = 360 * (PI/180) / classNum;
    var eachAngle = Math.PI * 2 / classNum;

    var drawArc = d3.svg.arc()
        .innerRadius(function(d, i) {
            return  arcMin + (arcWidth) + arcPad;
        })
        .outerRadius(function(d, i) {
            return arcMin;
        })
        .startAngle(function(d, i){

            return (i) * eachAngle;
            // return thetaScale(i+1)  ;
        })
        .endAngle(function(d, i) {

            return (i+1) * eachAngle - 5 * (PI/180);
            // return thetaScale(i + 2) - 5 * (PI/180);
        });

    var newNum = [];

    for(var i=0; i<classNum; i++){
    	newNum.push(i+1);
    }

    var colorArc = d3.scale.ordinal().domain(['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12']).range(['#FF4500', '#de3669', '#00D998', 'teal', '#00CD00','#f2cc03', '#9400D3', '#b58453', '#e3701e', '#F07484','#FFCEA6', '#bfbfbf']);
    
    // bind the data
    var arcs = svg.append("g").selectAll('.arcBound')
        // .data(classOrder(order))
        .data(className)
        .enter()
        .append('path')
        .attr("transform", "translate(300,300)")
        .attr("class","arcs")

    // *** update existing arcs -- redraw them ***
    arcs.attr("d", drawArc)
        .attr("fill", '#F5F5DC')
        // .attr('stroke','#ccc')
        .attr('stroke',function(d,i){ return colorArc(d); })
        .attr('stroke-width',4)
        .attr('id',function(d){
            return d;
        })
        .on('click',function(c,i){
            d3.selectAll('.dot')
            .data(classes)
            .style('fill',function(d,j){
                if( d.classId == c){
                    return colorArc(c);
                }else{
                    return '#8b8e88';
                }
            })
            .style('opacity',function(d,j){
                // return d.classValue;
                return 1;
            });

            arcs.attr('stroke',function(d,j){
                if(i == j){ return colorArc(d);}
                else{return '#8b8e88';}
            })
        });


var counter = 0;
   //var counter = 1;

    var histMin = 115;        // inner radius of the first arc
    var histWidth = (arcWidth - 5)/20;      // width
    var histPad = 1;         // padding between arcs

    // histAngle  = eachAngle - 5 * (PI/180);

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

            dd.id = className[counter];

            max = max > dd.value ? max : dd.value;

            return dd;
        })

        // var histScale = d3.scale.linear().domain([0,classes.length]).range([0,eachAngle]);
        var histScale = d3.scale.linear().domain([0,max]).range([0,eachAngle]);

        var drawHist = d3.svg.arc()
            .innerRadius(function(d, i) {
                return  histMin + d.key*(histWidth) + histPad;
            })
            .outerRadius(function(d, i) {
                return histMin + (d.key+1)*(histWidth);
            })
            .startAngle(function(d, i){

                // return (counter) * eachAngle + (eachAngle - histScale(d.value)) / 2 + 5 * (PI/180);
                return (counter) * eachAngle + (eachAngle - (d.value / max * eachAngle)) / 2;
            })
            .endAngle(function(d, i) {
               
                // return (counter) * eachAngle + histScale(d.value) + (eachAngle - histScale(d.value)) / 2;
                return (counter) * eachAngle + (d.value / max * eachAngle) + (eachAngle - (d.value / max * eachAngle)) / 2 - 5 * (PI/180);
               
            });        

        // bind the dataa
        var hists = svg.append("g").selectAll('.hist')
            .data(reducedData)
            .enter()
            .append('path')
            .attr("transform", "translate(300,300)")
            .attr("class","hists")

        // var maxValue = d3.max(reducedData,function(d){return d.value;});
        var linear = d3.scale.linear()
                            .domain([0,19])
                            .range([0,1]);

        var a = d3.rgb(180,144,202);
        // var b = d3.rgb(94,231,223);
        var b =d3.rgb(51,161,131);

        var computeColor = d3.interpolate(a,b);

        // *** update existing arcs -- redraw them ***
        hists.attr("d", drawHist)
            .attr("fill",function(d,i){
                var t = linear(i);
                    var color = computeColor(t);
                    return color.toString();
            })
            .attr('stroke','none')
            .on("mouseover",tip.show)
            .on("mouseout",tip.hide)
            .on("click",function(re,i){
                d3.selectAll('.dot')
                .data(classes)
                .style('fill',function(d,j){

                    if(re.key * 0.05 <= d[re.id] && d[re.id] <= (re.key + 1) * 0.05){
                        return colorArc(re.id);
                    }else{
                        return '#8b8e88';
                    }
                    
                })
                .style('opacity',function(d,j){
                // return d.classValue;
                    return 1;
                })

                hists.style('stroke',function(d,j){
                    if(i == j){
                        return "black";
                    }
                });
            });

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
                                        y: 540,
                                        width: 140,
                                        height: 10
                                    })
                                    .style("fill","url(#"+ linearGradient.attr("id") +")"); 

        //添加一个标题
                svg.append("text")
                .text("membership degree")
                .attr("x","90")
                .attr("y","520")
                .attr("font-size","8px")
                // .attr("font-weight","bold")
                .attr("text-anchor","middle")
                .attr("fill","gray");

                var minValueText = svg.append("text")
                                        .attr("class","valueText")
                                        .attr({
                                            x: 20,
                                            y: 540,
                                            dy: "-0.3em",
                                            fill: "gray"
                                        })
                                        .text(0);
                var maxValueText = svg.append("text")
                                        .attr("class","valueText")
                                        .attr({
                                            x: 160,
                                            y: 540,
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
                .attr("transform", "translate(20,550)")
                .attr("fill","gray")
                .call(axis);     
    })
}
