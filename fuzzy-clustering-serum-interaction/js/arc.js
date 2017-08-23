function renderArcs(classes,flag){
    var h;
    if(interv == 10){ h = 0.10;}
    if(interv == 20){ h = 0.05;}
    if(interv == 5){ h = 0.20;}

    var svg = d3.select("svg");

    var tip = d3.tip()
        .attr("class","d3-tip")
        .offset([-10,0])
        .html(function(d,i){
            var start = h*d.key;
            start = start.toFixed(2);
            var end = h*(d.key+1);
            end = end.toFixed(2);
            return "<strong>Interval:</strong> <span style='color:#FCA66F'>" + '['+ start + ',' + end + ']' + "</span> </br> <strong>Numbers:</strong> <span style='color:#FCA66F'>" + d.value + "</span>";
          
        })

    svg.call(tip);


	var PI = Math.PI;
    var arcMin = 182;        // inner radius of the first arc
    var arcWidth = 90;      // width
    var arcPad = 1;         // padding between arcs

    // var order = [];

    // var classNum = d3.keys(classes[0]).length;
    var classNum = order.length;

    // console.log(classNum);
    // var className = dimensions(classNum,order);
    var className = dimensions(classNum,order);

    function dimensions(cNum,order){
         var dimensions = [];
         for(var i=0; i<cNum; i++){
            dimensions.push("C" + order[i]);
         }
         return dimensions;
    };

   
    var da = newData(classes,order);
       
    var sum = 0;
        for(var i=0; i<da.length; i++){
            sum += da[i][1]; 
        }
     
    // console.log(da);
    var angleSize = getAngle(da,sum,order.length);
       
    // console.log(angleSize);

    var uneven_eachAngle = [];
    for(var i=0; i<angleSize.length - 1; i++){
        uneven_eachAngle[i] = angleSize[i+1] - angleSize[i];
    }
    // console.log(uneven_eachAngle);
   
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
      

    if(!isUneven){
        drawArc.startAngle(function(d, i){

            return (i) * eachAngle - (eachAngle-1 * (PI/180)) / 2;
            // return thetaScale(i+1)  ;
        })
        .endAngle(function(d, i) {

            return (i+1) * eachAngle - 2 * (PI/180) - (eachAngle-1 * (PI/180)) / 2;
            // return thetaScale(i + 2) - 5 * (PI/180);
        });
    }else{
        drawArc.startAngle(function(d, i){
           return angleSize[i];            
        })
        .endAngle(function(d, i) {
           return angleSize[i+1] - 2 * (PI/180);
        });

    }
        
        

    var newNum = [];

    for(var i=0; i<classNum; i++){
    	newNum.push(i+1);
    }

    var colorArc = d3.scale.ordinal().domain(['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12','C13']).range(['#FF4500', '#de3669', '#00D998', 'teal', '#00CD00','#f2cc03', '#9400D3', '#b58453', '#e3701e', '#F07484','#FFCEA6', '#bfbfbf', '#B32748']);
    
    // bind the data
    var arcs = svg.append("g")
        
        .selectAll('.arcBound')
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
    // if(isPie){
    //     arcs.style("cursor", 'pointer');
    // }
    //     .style("cursor", 'pointer')
    //     .on('click',clusterClick);

        

    var drawColor = d3.svg.arc()
                .innerRadius(function(d,i){
                    return arcMin + 14 + arcPad;
                })
                .outerRadius(function(d,i){
                    return arcMin;
                });
    if(!isUneven){
        drawColor.startAngle(function(d,i){
                return (i) * eachAngle - (eachAngle-1 * (PI/180)) / 2;
            })
            .endAngle(function(d,i){
                return (i+1) * eachAngle - 2 * (PI/180) - (eachAngle-1 * (PI/180)) / 2;
            }); 
    }else{
        drawColor.startAngle(function(d, i){
                return angleSize[i];            
            })
            .endAngle(function(d, i) {
                return angleSize[i+1] - 2 * (PI/180);
            }); 
    }
                
                

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
            .on('click',clusterClick);
    // if(isPie){
    //     colorHist.style("cursor", 'pointer');
    // }else{
    //     colorHist.on('click',clusterClick);
    // }
    
        // colorHist.on('click',clusterClick);
   
            


    var counter = 0;
  
    var histMin = 185;        // inner radius of the first arc
    // var histWidth = (arcWidth - 5)/20;      // width
    var histWidth = (arcWidth-16)/interv;
    var histPad = 1;         // padding between arcs

    // histAngle  = eachAngle - 5 * (PI/180);
    var linear = d3.scale.linear()
                        .domain([0,19])
                        .range([0,1]);

    
    var a = d3.rgb(220,220,220);
    var b = d3.rgb(220,220,220);
    var computeColor = d3.interpolate(a,b);

    var reList = [];
    var arcs = svg.append("g")
            .attr("id","arcs");//绘制hists、histsP的容器

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
        var reducedByArea = prepReduceData.dimension(function(d) { 
            if(interv == 10){
                return parseInt(d * 10);
            }
            if(interv == 20){
                return parseInt(d * 100 / 5);
            }
            if(interv == 5){
                return parseInt(d * 5);
            }
             
        }),
            reducedVolumeByArea = reducedByArea.group().reduceCount(),
            reducedData = reducedVolumeByArea.all();
       
        classesData.push(reducedData);
        
        reducedData.forEach(function(dd){

            dd.id = className[counter];

            max = max > dd.value ? max : dd.value;
            min = min < dd.value ? min : dd.value;

            return dd;
        })

        var getHistAngle = function(reducedData){
            var histMin = 3 * (PI/180),
                histMax = 28 * (PI/180),
                histAngle = [];
            for(var i=0; i<reducedData.length; i++){
                histAngle[i] = histMin + (histMax - histMin) * (reducedData[i].value - min)/(max - min);
            }

            return histAngle;
        }
        var getUnevenAngle = function(reducedData,eachAngle){
            var histMin = 3*(PI/180);        
            var unevenAngle = [];           
            for(var i=0; i<reducedData.length; i++){
                var histMax = eachAngle - 2 * (PI/180);
                unevenAngle[i] = histMin + (histMax - histMin)* (reducedData[i].value - min)/(max - min);
            }

            return unevenAngle;
        }
       
        // var histScale = d3.scale.linear().domain([0,max]).range([0,eachAngle]);

        var histAngle = getHistAngle(reducedData);
        var unevenAngle = getUnevenAngle(reducedData,uneven_eachAngle[counter]);
        // console.log(unevenAngle);

        var drawHist = d3.svg.arc()
            .innerRadius(function(d, i) {
                return  histMin + d.key*(histWidth) + 15;
            })
            .outerRadius(function(d, i) {
                return histMin + (d.key+1)*(histWidth) + 15;
            });

        if(!isUneven){
            drawHist.startAngle(function(d, i){

                // return (counter) * eachAngle + (eachAngle - histScale(d.value)) / 2 + 5 * (PI/180);
                // return (counter) * eachAngle + (eachAngle - (d.value / max * eachAngle)) / 2 - (eachAngle-1 * (PI/180)) / 2;
                return (counter) * eachAngle + (eachAngle - histAngle[i]) / 2 - (eachAngle-1 * (PI/180)) / 2;
            })
            .endAngle(function(d, i) {
               
                // return (counter) * eachAngle + histScale(d.value) + (eachAngle - histScale(d.value)) / 2;
                // return (counter) * eachAngle + (d.value / max * eachAngle) + (eachAngle - (d.value / max * eachAngle)) / 2 - 2 * (PI/180) - (eachAngle-1 * (PI/180))/ 2;
                return (counter) * eachAngle + histAngle[i] + (eachAngle - histAngle[i]) / 2 - 2 * (PI/180) - (eachAngle-1 * (PI/180))/ 2;
               
            }); 
        }else{
            drawHist.startAngle(function(d, i){
               
                return angleSize[counter] + (uneven_eachAngle[counter]  - unevenAngle[i]) / 2;
            })
            .endAngle(function(d, i) {
               
                return angleSize[counter] + (uneven_eachAngle[counter] - unevenAngle[i]) / 2 + unevenAngle[i] - 2 * (PI/180);
               
            }); 
        }
              

        // bind the data
        var hists = arcs.append("g")          
            .selectAll('.hists')
            .data(reducedData)
            .enter()
            .append('path')
            .attr("transform", "translate(320,300)")
            .attr("class","hists")
                 

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
            .on("click",histsClick);
        
            

         var t = 0;

         window.addEventListener("keyup", function checkKeyPressed(e) {
            hists.on('click',histsClick);

         });

         window.addEventListener("keydown", function checkKeyPressed(e) {
            if (e.keyCode == "17") {

                hists.on('click',function(de,i){
                    reList.push(de);

                d3.selectAll('.dot')
                   .style("fill","none")
                   .style("opacity",0);
                   
                    
                    d3.selectAll('.arcs').attr('stroke','gray');
                    d3.selectAll('.arcs').attr('stroke-width',2);

                var t = d3.transition()
                    .duration(10);
             
                d3.selectAll('.dot')
                    .data(classes)
                    .style('fill',function(d,j){
                        var maxOpacity=0;
                        var color="none";
                        for(let k=0;k<reList.length;k++){
                            var re  = reList[k];
                            if(re.key * 0.10 <= d[re.id] && d[re.id] <= (re.key + 1) * 0.10){
                
                                if((re.key) * 0.10 < 0.10){
                                    color = maxOpacity>d[re.id]?color:'#8b8e88';
                                    maxOpacity = maxOpacity>d[re.id]?maxOpacity:d[re.id];
                                }
                                else{
                                    color = maxOpacity>0.1?color:colorArc(re.id);//判断上次的透明度，小于0.1表明是灰色，就更新为现在的颜色
                                    maxOpacity = maxOpacity>0.1?maxOpacity:0.1;      
                                }
                            }
                        }
                        return color;
                        
                    })
                    .style('opacity',function(d,j){

                        var isSelected=false;
                        var maxOpacity=0;
                        for(let m=0;m<reList.length;m++){
                            var ke  = reList[m];
                            if(ke.key * 0.10 <= d[ke.id] && d[ke.id] <= (ke.key + 1) * 0.10){
                //当多个区间选中的数据点有重叠，应以隶属度大的为最终显示结果            
                                isSelected=true;
                                if((ke.key) * 0.10 >= 0.10)
                                    maxOpacity = maxOpacity>d[ke.id]?maxOpacity:d[ke.id];
                                else
                                    maxOpacity = maxOpacity>0.1?maxOpacity:0.1;

                            }   
                        }
                        if(!isSelected)
                            return 0;
                        else
                            return maxOpacity;
                    });
               
                    d3.select(this).classed('selected_mutil', true); 

                });
            }
        }, false);

        
        // console.log(reducedData);
        // console.log(classes);
        counter += 1;
                   
    })
// console.log(classes);
      

    function clusterClick(c,i){
       
            reList = [];

            d3.selectAll('.selected').classed('selected', false);
            
            d3.selectAll('.selected_mutil').classed('selected_mutil', false);
            
            d3.select('svg').selectAll('.dot')
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

            d3.selectAll('.arcs').attr('stroke',function(d,j){
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
       
    }

    function histsClick(re){
        // console.log(d3.select(this).attr('selected'));
        if(d3.select(this).attr('selected')=="yes"){

            d3.select(this).attr('selected',"no");
            d3.select(this).classed('selected', false);

            d3.select('svg').selectAll('.dot')
                .data(classes)
                .style('fill',function(d,j){
                    return colorArc(d.classId);
                                       
                })
                .style('opacity',function(d,j){
                    return d.classValue;       
                });

            d3.selectAll('.arcs').attr('stroke',function(d,j){
                    return 'gray';
            })
            .attr('stroke-width',function(d,j){
                    return 2;
            }); 
        }else{
            d3.select(this).attr('selected',"yes");
            reList = [re];
            d3.select('svg').selectAll('.dot')
                .style("fill","none")
                .style("opacity",0);

            //若之前单击了cluster，让其style还原
            d3.selectAll('.arcs').attr('stroke',function(d,j){
                    return 'gray';
            })
            .attr('stroke-width',function(d,j){
                    return 2;
            }); 
                 
            d3.selectAll(".selected").attr("selected","no");
            //若之前单击条条或者选择了多个条条，让其还原
            d3.selectAll('.selected').classed('selected', false);
            d3.selectAll('.selected_mutil').classed('selected_mutil', false);

            d3.selectAll('.arcs').attr('stroke','gray');
            d3.selectAll('.arcs').attr('stroke-width',2);

            d3.select('svg').selectAll('.dot')
                .data(classes)
                .style('fill',function(d,j){
                        if(re.key * h <= d[re.id] && d[re.id] <= (re.key + 1) * h){
                            // return colorArc(re.id);
                            if((re.key + 1) * h <= 0.15)
                                return '#8b8e88';
                            else
                                return colorArc(re.id);
                        }                  
                })
                .style('opacity',function(d,j){
                  
                        if(re.key * h <= d[re.id] && d[re.id] <= (re.key + 1) * h){
                        if((re.key + 1) * h >= 0.15)
                            return d[re.id];
                        else
                        return 0.1;
                        }
                        else{
                            return 0;
                        }
                    
                });
               
            d3.select(this).classed('selected', true); 
        }

        
    }  


 
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
}


