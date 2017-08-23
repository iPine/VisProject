var utils = {
    merge: function(obj1, obj2) {
        for (var p in obj2) {
            if (obj2[p] && obj2[p].constructor == Object) {
                if (obj1[p]) {
                    this.merge(obj1[p], obj2[p]);
                    continue;
                }
            }
            obj1[p] = obj2[p];
        }
    },
    mergeAll: function() {
        var newObj = {};
        var objs = arguments;
        for (var i = 0; i < objs.length; i++) {
            this.merge(newObj, objs[i]);
        }
        return newObj;
    },
    htmlToNode: function(htmlString, parent) {
        while (parent.lastChild) {
            parent.removeChild(parent.lastChild);
        }
        return this.appendHtmlToNode(htmlString, parent);
    },
    appendHtmlToNode: function(htmlString, parent) {
        return parent.appendChild(document.importNode(new DOMParser().parseFromString(htmlString, "text/html").body.childNodes[0], true));
    }
};

var radvizComponent = function() {
    var config = {
        el: null,
        size: 400,
        margin: 50,
        colorScale: d3.scale.ordinal().range([ "skyblue", "orange", "lime" ]),
        colorAccessor: null,
        opacityAccessor: null,
        dimensions: [],
        drawLinks: false,
        zoomFactor: 1,
        dotRadius: 4,
        useRepulsion: false,
        useTooltip: false,
        tooltipFormatter: function(d) {
            return d;
        }
        
    };
    var events = d3.dispatch("panelEnter", "panelLeave", "dotEnter", "dotLeave");
    var force = d3.layout.force()
            .chargeDistance(0.5)
            .charge(-15)
            .friction(0)
            .alpha(0)
            .linkDistance(20);

    var render = function(data) {

        data = addNormalizedValues(data);

        var normalizeSuffix = "_normalized";
        var dimensionNamesNormalized = config.dimensions.map(function(d) {
            return d + normalizeSuffix;
        });

        var thetaScale = d3.scale.linear().domain([ 0, dimensionNamesNormalized.length ]).range([ 0, Math.PI * 2 ]);
        
        var chartRadius = config.size / 1.5 - config.margin -70;
        var nodeCount = data.length;
        var panelSize = config.size - config.margin * 2 - 120;

        //获取聚类关联关系
        function getRelationship(data,dimensions){

            var relation = [];
            for(var i=0; i< dimensions.length; i++){
                relation[i] = [];
                for(var j=0; j< dimensions.length; j++){
                    relation[i][j] = 0;
                }
            }
            for(var j=0; j<data.length; j++){
                var da = data[j];
                var classId = da.classId;
                var id = parseInt(classId.substring(1)) - 1;
                for(var i=0; i< dimensions.length; i++){
                    if(id !== i){
                        
                        var name = "C" + (i+1);
                        relation[id][i] += da[name];
                    }
                } 
            }
            // console.log(relation);
            return relation;
        }

        var da = newData(data,order);
       
        var sum = 0;
        for(var i=0; i<da.length; i++){
            sum += da[i][1]; 
        }
        // console.log(sum);
        // console.log(da);
        var angleSize = getAngle(da,sum,order.length);
       
        // console.log(angleSize);
        var uneven_eachAngle = [];
        for(var i=0; i<angleSize.length - 1; i++){
            uneven_eachAngle[i] = angleSize[i+1] - angleSize[i];
        }
        // console.log(uneven_eachAngle);

        //初始化维度锚点
        var dimensionNodes = config.dimensions.map(function(d, i) {   

           if(!isUneven){
             var angle = thetaScale(i) - Math.PI / 2;
           }else{
             var angle = angleSize[i] - Math.PI / 2 + (uneven_eachAngle[i] / 2 - 1*(Math.PI/180));
           }

            var x = chartRadius + Math.cos(angle) * chartRadius * config.zoomFactor ;
            var y = chartRadius + Math.sin(angle) * chartRadius * config.zoomFactor ;
            
            return {
                index: nodeCount + i,
                x: x,
                y: y,
                fixed: true,
                name: d,
            };

        });
        
        //初始化连接线
        //source为数据点，target为维度锚点，value为相应隶属度值；
        var linksData = [];
        data.forEach(function(d, i) {
            var max=0;
            var maxIndex=0;

            dimensionNamesNormalized.forEach(function(dB, iB) {
                if(d[dB]>max){
                    max=d[dB];
                    maxIndex=iB;
                }
            });

            dimensionNamesNormalized.forEach(function(dB, iB) {
            //权重
                // if(iB==maxIndex){
                //     d[dB]=d[dB]*5;
                // }
                // else{
                //     d[dB]=d[dB];
                // }
            //0-1
            // if(dB=="C1_normalized"){
                // if(d[dB]>=0.1 && d[dB] <=0.5){
                //     d[dB] = 1;
                // }
                // else if(d[dB] >0.5){
                //     d[dB] = d[dB] * 0;
                // }
                // else{
                //     d[dB] = 0;
                // }
            // }
                linksData.push({
                    source: i,
                    target: nodeCount + iB,
                    value: d[dB]
                });

            });
        });

        // console.log(linksData);
        //设置力导向布局各参数
        force.size([ panelSize, panelSize ])
                .linkStrength(function(d) {

                    return d.value;                    
                })
         //增添dimensionNodes中的值到data后面，形成新的副本，data不变 
         //新副本的长度为data.length + dimension.length      
                .nodes(data.concat(dimensionNodes))
                .links(linksData)
                .start();


        var svg = d3.select("svg");
        
        var root = svg.append("g").attr({
            transform: "translate(" + [ 140, 120 ] + ")"
        });

        var panel = root.append("circle").classed("panel", true).attr({
            r: chartRadius,
            cx: chartRadius,
            cy: chartRadius,
        });


        // brush刷功能;  
    function brushShow(){
        var x = d3.scale.linear().range([0, chartRadius*2]),
            y = d3.scale.linear().range([0, chartRadius*2]);

        root.append('g')
            .attr('class','brush')
            .call(d3.svg.brush().x(x).y(y)
            .on("brushstart", brushstart)
            .on("brush", brushmove)
            .on("brushend", brushend))
            // .style("display","none");
    }

//jquery控制brush       
        $(function(){
          $("#brushbox").click(function(){
            var isSelected = $(this).attr("checked");
            // alert(isSelected);
            if(isSelected == 'checked'){ 
             
              brushShow();  
            }else{
             
              d3.select(".brush").remove();

            }
          })
        });


        function brushstart() {
          root.classed("selecting", true);
        }

        var counter;
        var PI = Math.PI;
        var arcMin = 182;        // inner radius of the first arc
        var arcWidth = 90;      // width
        var arcPad = 1;         // padding between arcs
        var histMin = 185;        // inner radius of the first arc
        // var histWidth = (arcWidth - 5)/20;      // width
        var histWidth = (arcWidth-16)/10;
        var histPad = 1;         // padding between arcs
        var eachAngle = Math.PI * 2 / cNum;
        var histAngle;
        var unevenAngle;
        var min=0,max=0;
        
        function brushmove() {
          var e = d3.event.target.extent();
          
          var classes = dimensions(cNum,order);
          var points=[];
          d3.select('svg').selectAll('circle.dot')
            .data(data)
            .style("opacity", function(d) {
               
                var flag = e[0][0]*chartRadius*2 <= d.x && d.x <= e[1][0]*chartRadius*2
                    && e[0][1]*chartRadius*2 <= d.y && d.y <= e[1][1]*chartRadius*2;
                if(flag){
                    points.push(d);
                    return d.classValue;
                }else
                    return 0.5;
                // return !flag; 
            })
            .style("fill", function(d) {
                
                var flag = e[0][0]*chartRadius*2 <= d.x && d.x <= e[1][0]*chartRadius*2
                    && e[0][1]*chartRadius*2 <= d.y && d.y <= e[1][1]*chartRadius*2;
                if(flag){
                    return colorAnchor(d.classId);
                }else
                    return 'gray';
            });

            var arr={};
            // console.log(classes);

            classes.forEach(function(c,j){
                
                var bar = [];
                for(let i = 0;i<10;i++){
                    let temp={};
                    temp.id=c;
                    temp.value=0;
                    temp.key=i;
                    bar.push(temp);
                }

                // console.log(order);
                points.forEach(function(d){

                    bar[parseInt(d[c]/0.1)].value++;
                });
                var arc=[];
                for(let i=0;i<10;i++){
                    if(bar[i].value>0){
                        arc.push(bar[i]);
                    }
                }

                arr[c]=arc;

            });

            // console.log(arr);
            counter = 0;
            classes.forEach(function(d,i){

                var reducedData = arr[d];
                //classesData[]是全局变量，获取的是原始hists的数据
                var classData=classesData[i]; 
                min=0;
                max=0;

                for(let i=0;i<classData.length;i++){
                    if(classData[i].value<min){
                        min=classData[i].value;
                    }
                    if(classData[i].value>max){
                        max=classData[i].value;
                    }
                }
                // console.log(max);
                 histAngle = getHistAngle(classData);
                
                 var unevenAngle = getUnevenAngle(classData,uneven_eachAngle[counter]);
                 

                // console.log(histAngle);
                // console.log(unevenAngle);
                // console.log(unevenAngle[0]);

                var drawHist = d3.svg.arc()
                           .innerRadius(function(d, i) {

                               return  histMin + d.key*(histWidth) + 15;
                           })
                           .outerRadius(function(d, i) {
                               return histMin + (d.key+1)*(histWidth) + 15;
                           })
                           .startAngle(function(d, i){                        
                               for(let j=0;j<classesData.length;j++){
                                   if(classesData[j][0].id==d.id){                            
                                       for(let k=0;k<classesData[j].length;k++){
                                           var h=classesData[j][k];
                                           if(h.key==d.key){
                                               var p=d.value/h.value;                                
                                               if(!isUneven){
                                                return (counter) * eachAngle + (eachAngle - histAngle[k]*p) / 2 - (eachAngle-1 * (PI/180)) / 2;
                                               }else{
                                                    return angleSize[counter] + (uneven_eachAngle[counter]  - (p * unevenAngle[k])) / 2;
                                               }
                                                                   
                                           }
                                       }
                                   }
                               }              
                           })
                           .endAngle(function(d, i) {
                               for(let j=0;j<classesData.length;j++){
                                   if(classesData[j][0].id==d.id){
                                       
                                       for(let k=0;k<classesData[j].length;k++){
                                           var h=classesData[j][k];
                                           if(h.key==d.key){
                                               var p=d.value/h.value;
                                               if(!isUneven){
                                                return (counter) * eachAngle + histAngle[k]*p + (eachAngle - histAngle[k]*p) / 2 - 2 * (PI/180) - (eachAngle-1 * (PI/180))/ 2;
                                               }else{
                                                return angleSize[counter] + (uneven_eachAngle[counter] - (p * unevenAngle[k])) / 2 + (p * unevenAngle[k]) - 2 * (PI/180);
                                               } 
                                           }
                                       }
                                   }
                               }
                               
                           }); 


                var histsP=svg.select("#arcs").selectAll('.histsP'+d)
                    .data(reducedData);

                histsP.enter()
                    .append('path')
                    .attr("transform", "translate(320,300)")
                    .attr("class","histsP"+d)
                    .attr('id','histsP')
                    .attr("d", drawHist)
                    .attr("fill",function(d,i){
                        return "#FCA66F";
                    });

                histsP.attr("transform", "translate(320,300)")
                    .attr("class","histsP"+d)
                    .attr("d", drawHist)
                    .attr("fill",function(d,i){
                        return "#FCA66F";
                    });

                histsP.exit().remove();

                counter++;
            });
                
        }

        function brushend() {
          root.classed("selecting", !d3.event.target.empty());
          var e = d3.event.target.extent();
          if(e[0][0]*chartRadius*2 == e[1][0]*chartRadius*2 && e[0][1]*chartRadius*2 == e[1][1]*chartRadius*2){
                
                d3.select('svg').selectAll('circle.dot')
                .data(data)
                .style("opacity", function(d){
                    return d.classValue;
                })
                .style("fill",function(d){
                    return colorAnchor(d.classId);
                })
          }
        }

        //均匀排布，每个条条的大小获取
        var getHistAngle = function(reducedData){

            var histMin = 3 * (PI/180),
                histMax = 30 * (PI/180),
                histAngle = [];

            for(var i=0; i<reducedData.length; i++){
                histAngle[i] = histMin + (histMax - histMin) * (reducedData[i].value - min)/(max - min);
            }
            // console.log(histAngle);
            return histAngle;
        }
        //不均匀排布，每个条条的大小获取
         var getUnevenAngle = function(reducedData,eachAngle){
            var histMin = 3*(PI/180);        
            var unevenAngle = [];           
            for(var i=0; i<reducedData.length; i++){
                var histMax = eachAngle - 2 * (PI/180);
                unevenAngle[i] = histMin + (histMax - histMin)* (reducedData[i].value - min)/(max - min);
            }

            return unevenAngle;
        }
    

        if (config.useRepulsion) {
            root.on("mouseenter", function(d) {
                force.chargeDistance(55).friction(0.35);
                events.panelEnter();
            });
            root.on("mouseleave", function(d) {
                force.chargeDistance(0).resume();
                events.panelLeave();
            });
        }

         //绘制聚类关联关系
         var relationship = getRelationship(data,dimensionNodes);
            for (var i = 0; i < dimensionNodes.length; i++) {
                for (var j = i + 1; j < dimensionNodes.length; j++) {

                    var relation = relationship[i][j] + relationship[j][i];
        
         // if(cNum == 10){order = [1, 10, 9, 8, 7, 6, 5, 2, 3, 4];}
         //  if(cNum == 7){order = [ 6, 3, 1, 5, 7, 4, 2];}
         //  if(cNum == 8){order = [1, 4, 3, 7, 8, 5, 6, 2];}
         //  if(cNum == 9){order = [1, 6, 8, 5, 7, 4, 9, 3, 2];}
         //  if(cNum == 11){order = [11, 5, 3, 1, 9, 2, 10, 4, 7, 6, 8];}
                    var order1 = [];
                    if(flag){
                        if(cNum == 11) {order1 = [3,5,2,7,1,9,8,10,4,6,0];}
                        if(cNum == 10){order1 = [0, 7, 8, 9, 6, 5, 4, 3, 2, 1];}
                        if(cNum == 7){order1 = [2, 6, 1, 5, 3, 0, 4];}
                        if(cNum == 8){order1 = [0, 7, 2, 1, 5, 6, 3, 4];}
                        if(cNum == 9){order1 = [0, 8, 7, 5, 3, 1, 4, 2, 6];}
                    }
                
                      root.append('path')
                        .attr('class', 'chord')
                        .attr('d', function() {
                            var begin;
                            var end;
                            if(flag){
                              begin = dimensionNodes[order1[i]];
                              end = dimensionNodes[order1[j]];
                            }else{
                              begin = dimensionNodes[i];
                              end = dimensionNodes[j];
                            }
                
                            var pathStr = 'M' + begin.x + ',' + begin.y + ' ' + 'Q' + 199 + ',' +  188.5 + ' ' + end.x + ',' + end.y;
                            return pathStr;
                        })
                        // .attr('stroke', '#CDCDB4')
                        .attr('stroke', '#707476')
                        .attr('stroke-opacity',  0.1*Math.sqrt(relation) )
                        .attr('stroke-width', Math.sqrt(relation))
                        .attr('fill-opacity', 0)
                        .style('display','none')
                        .on('click',function(d,i){
                            d3.select('.chordSelect').classed('chordSelect',false);

                            
                            d3.select(this).classed('chordSelect',true);
                        })             
                        
                }
            }

//jquery控制chord
            $(function(){
                $("#relationbox").click(function(){
                    var isSelected = $(this).attr("checked");
                    if(isSelected == 'checked'){
                        
                        root.selectAll('.dot').attr('opacity',0);
                        root.selectAll('.pie').attr('opacity',0);
                        root.selectAll('.chord').style('display','block');
                        // showRelation = 1;
                    }else{
                        
                        root.selectAll('.chord').style('display','none');
                        root.selectAll('.dot').attr('opacity',function(d){
                                    return config.opacityAccessor(d);});
                        root.selectAll('.pie').attr('opacity',1);
                        // showRelation = 0;
                    }
                });
            });
            // console.log(showRelation);
        
   
        var colorAnchor = d3.scale.ordinal().domain(['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12']).range(['#FF4500', '#de3669', '#00D998', 'teal', '#00CD00','#f2cc03', '#9400D3', '#b58453', '#e3701e', '#F07484','#FFCEA6', '#bfbfbf']);
    

        // 绘制代表聚类的圆圈
        // var labelNodes = root.selectAll("circle.label-node")
        //     .data(dimensionNodes)
        //     .enter()
        //     .append("circle")
        //     .classed("label-node", true)
        //     .attr({
        //     cx: function(d) {
        //         return d.x;
        //     },
        //     cy: function(d) {
        //         return d.y;
        //     },
        //     r: 5,
        //     fill: function(d,i) {                          
        //         return colorAnchor(d.name);
        //     },
        //     opacity: function(d){
        //         if(showRelation)
        //             return 0;
        //         else
        //             return 1;
        //     }
        // });

        //聚类名字
        var labels = root.selectAll("text.label").data(dimensionNodes).enter().append("text").classed("label", true).attr({
            x: function(d) {
                return d.x;
            },
            y: function(d) {
                return d.y;
            },
            "text-anchor": function(d) {
                if (d.x > panelSize * .4 && d.x < panelSize * .6) {
                    return "middle";
                } else {
                    return d.x > panelSize / 2 ? "start" : "end";

                }
               
            },
            "dominant-baseline": function(d) {
                return d.y > panelSize * .6 ? "hanging" : "auto";
            },
            
        }).text(function(d) {
            return d.name;
        });

                    
        
        setTimeout(function(){
            var n = 10000;
            for(var i = n; i>0; --i){
                force.tick();
            }

            force.stop();

            // Links
            if (config.drawLinks) {
                var links = root.selectAll(".link").data(linksData).enter().append("line").classed("link", true);
            }
            renderDot(data);

//jquery控制数据点的显示
            $(".datamode").click(function(){
              var mode = $(this).attr("id");
              if(mode == "Pie"){
                d3.selectAll('.arcs').style("cursor", 'default');
                d3.selectAll('.colorHist').style("cursor", 'default');
                d3.selectAll('.hists').style("cursor", 'default');
                
                renderPie(data);
 
              }
              if(mode == "Dot"){
         
                renderDot(data);
                 
              }
            })
            
            function renderPie(data){
               
                d3.select('svg').selectAll('.dot').remove();
                    //以饼显示数据点，添加点击事件，显示相应饼图
                    var pieD = pieData(data);
                    var pieAllD = pieAllData(data);
                    
                    var pie = d3.layout.pie()
                                .value(function(d){return d.value;})
                                .sort(null);

                    var arcNodes = d3.svg.arc()
                                .outerRadius(config.dotRadius)
                                .innerRadius(1);

                    var svgNodes = root.selectAll('svg')
                                    .data(data)
                                    .enter()
                                    .append('svg')
                                    .attr("class","pie")
                                    .style("width", (config.dotRadius) * 2 + "px")
                                    .style("height", (config.dotRadius) * 2 + "px")
                                    .append("g")
                                    .attr("transform", function(d, i) {
                                        return "translate(" + (d.x) + "," + (d.y) + ")"
                                    })

                    root.selectAll('svg .pie g')
                        .data(pieAllD)
                        .on('click',function(d,i){
                            clickPie(d);
                            
                        })
                        .style("cursor","pointer")

                    var g = svgNodes.selectAll('g')
                            .data(function(d,j){
                                return pie(pieD[j]);
                            })
                            .enter()
                            .append('g');


                    g.append('path')
                        .attr('d',arcNodes)
                        .attr('id',function(d,j){
                            return j;
                        })
                        .style('fill',function(d,i){
                            // console.log(d);
                            return colorAnchor(d.data.id);
                        })

            }
            

            function clickPie(data){
            
               d3.select('#col').selectAll('*').remove();
                             

               var width = 340;
               var height = 280;
               var radius = 130;

                var arc = d3.svg.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(0);

                var labelArc = d3.svg.arc()
                    .outerRadius(radius - 50)
                    .innerRadius(radius - 50);

                var pie = d3.layout.pie()
                    .sort(function(a,b){
                        return b.value - a.value;
                    })
                    .value(function(d,i){
                        return d.value;
                    })

                var svg = d3.select("#col").append('svg')
                    .attr('width',width)
                    .attr('height',height)
                    .append('g')
                    .attr('class','pie')
                    .attr('transform', 'translate(' + width/2 + ',' + 150 + ')')

                var g = svg.selectAll('.arc')
                    .data(pie(data))
                    .enter()
                    .append('g')
                    .attr('class','arc');

                g.append('path').attr('d',arc)
                    .style('fill',function(d,i){
                        return colorAnchor(d.data.id);
                    })
                // g.append('text')
                //     .attr('transform',function(d){
                //         return "translate(" + labelArc.centroid(d) + ")";
                //     })
                //     .text(function(d,i){
                //         return d.data.id + ':' + d.data.value;
                //     });
            }

            function renderDot(data){
              
                d3.select('svg').selectAll('.pie').remove();

                
                d3.selectAll('.colorHist').style("cursor", 'pointer');
                d3.selectAll('.hists').style("cursor", 'pointer');
                //以点显示数据点，添加鼠标事件显示隶属度条
                var nodes = root.selectAll("circle.dot")
                            .data(data.sort(function(a,b){
                                return b['classValue'] - a['classValue'];
                            }))
                            .enter()
                            .append("circle")
                            .classed("dot", true)
                            .attr({
                                r: config.dotRadius,
                                fill: function(d,i) {
                                    return config.colorScale(config.colorAccessor(d));
                                },
                                // opacity: function(d){
                                //     return config.opacityAccessor(d);
                                // },
                                // opacity: 0,
                                 
                                cx: function(d) {
                                    return d.x;
                                },
                                cy: function(d) {
                                    return d.y;
                                }
                               
                            })
                            .attr('opacity',function(d){
                                    return config.opacityAccessor(d);
                            })
                            .style("cursor", 'pointer')
                            .on("mouseenter", function(d) {
                                if (config.useTooltip) {
                                    var mouse = d3.mouse(config.el);
                                    // console.log(mouse);
                                    if(!showRelation)
                                    // tooltip.setText(config.tooltipFormatter(d)).setPosition(mouse[0], mouse[1]).show();
                                       tooltip.setList(config.tooltipFormatter(d)).setPosition(mouse[0], mouse[1]).show();
                                    else
                                        tooltip.hide();
                                }
                                events.dotEnter(d);
                                this.classList.add("active");
                            })
                            .on("mouseout", function(d) {
                                if (config.useTooltip) {
                                    tooltip.hide();
                                }
                                events.dotLeave(d);
                                this.classList.remove("active");
                            })
            }
                

        },1);
        

        var tooltipContainer = d3.select(config.el).append("div").attr({
            id: "radviz-tooltip"
        });
        var tooltip = tooltipComponent(tooltipContainer.node());
        return this;

    };

    var setConfig = function(_config) {
        config = utils.mergeAll(config, _config);
        return this;
    };
    
    //将隶属度值归一化到[0,1]区间
    var addNormalizedValues = function(data) {
        data.forEach(function(d,i) {
            config.dimensions.forEach(function(dimension) {
                d[dimension] = +d[dimension];
            });

        });

        var normalizationScales = {};
        config.dimensions.forEach(function(dimension) {
            normalizationScales[dimension] = d3.scale.linear().domain(d3.extent(data.map(function(d, i) {
                return d[dimension];
            }))).range([ 0, 1 ]);
        });

        data.forEach(function(d) {
            config.dimensions.forEach(function(dimension) {
                d[dimension + "_normalized"] = normalizationScales[dimension](d[dimension]);
            });
        });

        return data;
    };


    var exports = {
        config: setConfig,
        render: render
    };
    d3.rebind(exports, events, "on");
    return exports;
};

var tooltipComponent = function(tooltipNode) {
    var root = d3.select(tooltipNode).style({
        position: "absolute",
        "pointer-events": "none"
    });
    var setText = function(html) {
        root.html(html);
        return this;
    };

    var renderList = function(datum) {

        var width_scale = d3.scale.linear()
                            .domain([0,1])
                            .range([0,120]);

        d3.select('#radviz-tooltip').selectAll(".item").remove();

            var order = [];
            for(var i=0; i<cNum; i++){
                order.push(i+1);
            }
          
            var list = root.selectAll('div.item')
                .data(dimensions(cNum,order));

            list.enter()
                .append('div')
                .classed('item', true);

            list.transition()
                .style({
                    width: function(d) {
                        return width_scale(datum[d]) + 'px';
                    },
                })
                .text(function(d) {
                    return d + ': ' + datum[d].toFixed(3);
                });
            list.exit().remove();

            return this;
            
    };

    var position = function(x, y) {
        root.style({
            left: x + "px",
            top: y + "px"
        });
        return this;
    };
    var show = function() {
        root.style({
            display: "block"
        });
        return this;
    };
    var hide = function() {
        root.style({
            display: "none"
        });
        return this;
    };
    return {
        setText: setText,
        setList: renderList,
        setPosition: position,
        show: show,
        hide: hide
    };
};


