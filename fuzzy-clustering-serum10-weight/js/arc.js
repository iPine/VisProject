function renderArcs(classes,flag){

    var svg = d3.select("svg");

    var tip = d3.tip()
        .attr("class","d3-tip")
        .offset([-10,0])
        .html(function(d,i){
            var start = 0.10*d.key;
            start = start.toFixed(2);
            var end = 0.10*(d.key+1);
            end = end.toFixed(2);
            return "<strong>Interval:</strong> <span style='color:#FCA66F'>" + '['+ start + ',' + end + ']' + "</span> </br> <strong>Numbers:</strong> <span style='color:#FCA66F'>" + d.value + "</span>";
          
        })

    svg.call(tip);


	var PI = Math.PI;
    var arcMin = 182;        // inner radius of the first arc
    var arcWidth = 90;      // width
    var arcPad = 1;         // padding between arcs

    // var order = [];

    var classNum = d3.keys(classes[0]).length;

    // console.log(classNum);
    var className = dimensions(classNum,order);

    function dimensions(cNum,order){
         var dimensions = [];
         for(var i=0; i<cNum; i++){
            dimensions.push("C" + order[i]);
         }
         return dimensions;
    };

   
// console.log(classes);
   


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

            return (i) * eachAngle - (eachAngle-1 * (PI/180)) / 2;
            // return thetaScale(i+1)  ;
        })
        .endAngle(function(d, i) {

            return (i+1) * eachAngle - 2 * (PI/180) - (eachAngle-1 * (PI/180)) / 2;
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
        .attr("transform", "translate(320,300)")
        .attr("class","arcs")

    // *** update existing arcs -- redraw them ***
    arcs.attr("d", drawArc)
        .attr("fill", '#F5F5F5')
        .attr('stroke','gray')
        // .attr('stroke',function(d,i){ return colorArc(d); })
        .attr('stroke-width',2)
        .attr('id',function(d){
            return d;
        })
        

    var drawColor = d3.svg.arc()
                .innerRadius(function(d,i){
                    return arcMin + 14 + arcPad;
                })
                .outerRadius(function(d,i){
                    return arcMin;
                })
                .startAngle(function(d,i){
                    return (i) * eachAngle - (eachAngle-1 * (PI/180)) / 2;
                })
                .endAngle(function(d,i){
                    return (i+1) * eachAngle - 2 * (PI/180) - (eachAngle-1 * (PI/180)) / 2;
                });  

    var colorHist = svg.append('g').selectAll('.colorHist')
            .data(className)
            .enter()
            .append('path')
            .attr("transform", "translate(320,300)")
            .attr('class','colorHist')

    colorHist.attr('d',drawColor)
            .attr('fill',function(d){
                return colorArc(d);
            })
            .attr('opacity',0.8)
            .on('click',function(c,i){
                d3.selectAll('.selected').classed('selected', false);
                
                d3.selectAll('.dot')
                .data(classes)
                .style('fill',function(d,j){
                    if(d[c] < 0.1)
                        return 'gray';
                    else
                        return colorArc(c);
                    
                })
                .style('opacity',function(d,j){
                    if(d[c] < 0.1)
                        return 0.08;
                    else
                    return d[c];
                });

                arcs.attr('stroke',function(d,j){
                    if( i == j)
                    return colorArc(d);
                    else
                        return 'gray';
                })
                .attr('stroke-width',function(d,j){
                    if (i == j)
                        return 3;
                    else
                        return 2;
                });                
        });


    var counter = 0;
   //var counter = 1;

    var histMin = 185;        // inner radius of the first arc
    // var histWidth = (arcWidth - 5)/20;      // width
    var histWidth = (arcWidth-16)/10;
    var histPad = 1;         // padding between arcs

    // histAngle  = eachAngle - 5 * (PI/180);
    var reList = [];
    className.forEach(function(name){

        var max = 0;
        var min = 0;

        bucket = [];

        classes.forEach(function(d){

            meta = d[name];

            bucket.push(meta);
        })

        var prepReduceData = crossfilter(bucket);

        // var reducedByArea = prepReduceData.dimension(function(d) { return parseInt(d * 100 / 5); }),
        var reducedByArea = prepReduceData.dimension(function(d) { return parseInt(d * 10); }),
            reducedVolumeByArea = reducedByArea.group().reduceCount(),
            reducedData = reducedVolumeByArea.all();

        reducedData.forEach(function(dd){

            dd.id = className[counter];

            max = max > dd.value ? max : dd.value;
            min = min < dd.value ? min : dd.value;

            return dd;
        })

        var getHistAngle = function(reducedData){
            var histMin = 3 * (PI/180),
                histMax = 30 * (PI/180),
                histAngle = [];
            for(var i=0; i<reducedData.length; i++){
                histAngle[i] = histMin + (histMax - histMin) * (reducedData[i].value - min)/(max - min);
            }

            return histAngle;
        }

       
        // var histScale = d3.scale.linear().domain([0,max]).range([0,eachAngle]);

        var histAngle = getHistAngle(reducedData);

        var drawHist = d3.svg.arc()
            .innerRadius(function(d, i) {
                return  histMin + d.key*(histWidth) + 15;
            })
            .outerRadius(function(d, i) {
                return histMin + (d.key+1)*(histWidth) + 15;
            })
            .startAngle(function(d, i){

                // return (counter) * eachAngle + (eachAngle - histScale(d.value)) / 2 + 5 * (PI/180);
                // return (counter) * eachAngle + (eachAngle - (d.value / max * eachAngle)) / 2 - (eachAngle-1 * (PI/180)) / 2;
                return (counter) * eachAngle + (eachAngle - histAngle[i]) / 2 - (eachAngle-1 * (PI/180)) / 2;
            })
            .endAngle(function(d, i) {
               
                // return (counter) * eachAngle + histScale(d.value) + (eachAngle - histScale(d.value)) / 2;
                // return (counter) * eachAngle + (d.value / max * eachAngle) + (eachAngle - (d.value / max * eachAngle)) / 2 - 2 * (PI/180) - (eachAngle-1 * (PI/180))/ 2;
                return (counter) * eachAngle + histAngle[i] + (eachAngle - histAngle[i]) / 2 - 2 * (PI/180) - (eachAngle-1 * (PI/180))/ 2;
               
            }); 
     


        // bind the dataa
        var hists = svg.append("g").selectAll('.hists')
            .data(reducedData)
            .enter()
            .append('path')
            .attr("transform", "translate(320,300)")
            .attr("class","hists")
            .attr('id',function(d,i){
                return d.id+"_"+i;
            })
                 

        // var maxValue = d3.max(reducedData,function(d){return d.value;});
        var linear = d3.scale.linear()
                            .domain([0,19])
                            .range([0,1]);

        // var a = d3.rgb(180,144,202);
        var a = d3.rgb(220,220,220);
        // var b =d3.rgb(51,161,131);
        var b = d3.rgb(220,220,220);

        var computeColor = d3.interpolate(a,b);
        

        // *** update existing arcs -- redraw them ***
        hists.attr("d", drawHist)
            .attr("fill",function(d,i){
                var t = linear(i);
                    var color = computeColor(t);
                    return color.toString();
            })
            .attr('stroke','#434343')
            .on("mouseover",tip.show)
            .on("mouseout",tip.hide)
            .on("click",function(re,i){
                d3.selectAll('.dot')
                    .style("fill","none")
                    .style("opacity",0);
                                
                d3.selectAll('.selected').classed('selected', false);
                d3.selectAll('.arcs').attr('stroke','gray');
                d3.selectAll('.arcs').attr('stroke-width',2);

                d3.selectAll('.dot')
                .data(classes)
                .style('fill',function(d,j){
                        if(re.key * 0.10 <= d[re.id] && d[re.id] <= (re.key + 1) * 0.10){
                        // return colorArc(re.id);
                        if((re.key + 1) * 0.10 <= 0.15)
                            return '#8b8e88';
                        else
                            return colorArc(re.id);
                        }                  
                })
                .style('opacity',function(d,j){
                  
                        if(re.key * 0.10 <= d[re.id] && d[re.id] <= (re.key + 1) * 0.10){
                        if((re.key + 1) * 0.10 >= 0.15)
                            return d[re.id];
                        else
                        return 0.1;
                        }
                        else{
                            return 0;
                        }
                    
                })
               
                d3.select(this).classed('selected', true);        
            });
         window.addEventListener("keyup", function checkKeyPressed(e) {
            hists.on('click',function(re,i){
                d3.selectAll('.dot')
                    .style("fill","none")
                    .style("opacity",0);

               
                d3.selectAll('.selected').classed('selected', false);
                d3.selectAll('.selected_mutil').classed('selected_mutil', false);
                d3.selectAll('.arcs').attr('stroke','gray');
                d3.selectAll('.arcs').attr('stroke-width',2);

                d3.selectAll('.dot')
                .data(classes)
                .style('fill',function(d,j){
                        if(re.key * 0.10 <= d[re.id] && d[re.id] <= (re.key + 1) * 0.10){
                        // return colorArc(re.id);
                        if((re.key + 1) * 0.10 <= 0.15)
                            return '#8b8e88';
                        else
                            return colorArc(re.id);
                        }                  
                })
                .style('opacity',function(d,j){
                  
                        if(re.key * 0.10 <= d[re.id] && d[re.id] <= (re.key + 1) * 0.10){
                        if((re.key + 1) * 0.10 >= 0.15)
                            return d[re.id];
                        else
                        return 0.1;
                        }
                        else{
                            return 0;
                        }
                    
                });
                d3.select(this).classed('selected', true);  
            });
         });
         window.addEventListener("keydown", function checkKeyPressed(e) {
                    if (e.keyCode == "17") {
                        // reList[0] = reF;
                        hists.on('click',function(de,i){

                            reList.push(de);
                            // console.log(reList);
                       
                            d3.select('.selected').classed('selected', false);
                            d3.selectAll('.arcs').attr('stroke','gray');
                            d3.selectAll('.arcs').attr('stroke-width',2);

                        var t = d3.transition()
                            .duration(750);
                        d3.selectAll('.dot')
                            .data(classes).transition(t)
                            .style('fill',function(d,j){

                                for(let k=0;k<reList.length;k++){
                                    var re  = reList[k];
                                    if(re.key * 0.10 <= d[re.id] && d[re.id] <= (re.key + 1) * 0.10){
            
                                        if((re.key + 1) * 0.10 <= 0.15)
                                            return '#8b8e88';
                                        else
                                            return colorArc(re.id);                                       
                                    }
                                }
                                
                            })
                            .style('opacity',function(d,j){

                                var isSelected=false;

                                for(let k=0;k<reList.length;k++){
                                    var re  = reList[k];
                                    if(re.key * 0.10 <= d[re.id] && d[re.id] <= (re.key + 1) * 0.10){
                                        // return 1;
                                        isSelected=true;
                                        if((re.key + 1) * 0.10 >= 0.15)
                                            return d[re.id];
                                        else
                                            return 0.1;
                                    }
                                      
                                }
                                if(!isSelected)
                                    return 0;

                            });
                                             
                            d3.select(this).classed('selected_mutil', true); 
                        });
                    }
                }, false);

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
                                        y: 570,
                                        width: 140,
                                        height: 10
                                    })
                                    .style("fill","url(#"+ linearGradient.attr("id") +")"); 

        //添加一个标题
                svg.append("text")
                .text("membership degree")
                .attr("x","90")
                .attr("y","550")
                .attr("font-size","10px")
                // .attr("font-weight","bold")
                .attr("text-anchor","middle")
                .attr("fill","gray");

                var minValueText = svg.append("text")
                                        .attr("class","valueText")
                                        .attr({
                                            x: 20,
                                            y: 570,
                                            dy: "-0.3em",
                                            fill: "gray"
                                        })
                                        .text(0);
                var maxValueText = svg.append("text")
                                        .attr("class","valueText")
                                        .attr({
                                            x: 160,
                                            y: 570,
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
                .attr("transform", "translate(20,580)")
                .attr("fill","gray")
                .call(axis);     
    })
}
