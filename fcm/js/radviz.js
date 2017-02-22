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
    var force = d3.layout.force().chargeDistance(0).charge(-10).friction(0.5);
    var render = function(data) {

        data = addNormalizedValues(data);

        var normalizeSuffix = "_normalized";
        var dimensionNamesNormalized = config.dimensions.map(function(d) {
            return d + normalizeSuffix;
        });

        var thetaScale = d3.scale.linear().domain([ 0, dimensionNamesNormalized.length ]).range([ 0, Math.PI * 2 ]);
        
        var chartRadius = config.size / 2 - config.margin - 50;
        var nodeCount = data.length;
        var panelSize = config.size - config.margin * 2 - 200;

        

        //初始化维度锚点
        var dimensionNodes = config.dimensions.map(function(d, i) {
           
            var angle = thetaScale(i);
            var x = chartRadius + Math.cos(angle) * chartRadius * config.zoomFactor;
            var y = chartRadius + Math.sin(angle) * chartRadius * config.zoomFactor;
            return {
                index: nodeCount + i,
                x: x,
                y: y,
                fixed: true,
                name: d
            };
        });

        //初始化连接线
        var linksData = [];
        data.forEach(function(d, i) {
            dimensionNamesNormalized.forEach(function(dB, iB) {
                linksData.push({
                    source: i,
                    target: nodeCount + iB,
                    value: d[dB]
                });
            });
        });
        //设置力导向布局各参数
        force.size([ panelSize, panelSize ])
                .linkStrength(function(d) {
                    return d.value;
                })
                .nodes(data.concat(dimensionNodes))
                .links(linksData)
                .start();

        // var svg = d3.select(config.el).append("svg").attr({
        //     width: config.size,
        //     height: config.size
        // });

        var svg = d3.select("svg");

        // svg.append("rect").classed("bg", true).attr({
        //     width: config.size,
        //     height: config.size
        // });
        
        var root = svg.append("g").attr({
            transform: "translate(" + [ 300, 300 ] + ")"
        });

        var panel = root.append("circle").classed("panel", true).attr({
            r: chartRadius,
            cx: chartRadius,
            cy: chartRadius,
        });

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
 

        // //绘制代表聚类的圆圈
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
        //     r: 4
        // });

        // //聚类名字
        // var labels = root.selectAll("text.label").data(dimensionNodes).enter().append("text").classed("label", true).attr({
        //     x: function(d) {
        //         return d.x;
        //     },
        //     y: function(d) {
        //         return d.y;
        //     },
        //     "text-anchor": function(d) {
        //         if (d.x > panelSize * .4 && d.x < panelSize * .6) {
        //             return "middle";
        //         } else {
        //             return d.x > panelSize / 2 ? "start" : "end";
        //         }
        //     },
        //     "dominant-baseline": function(d) {
        //         return d.y > panelSize * .6 ? "hanging" : "auto";
        //     },
        //     dx: function(d) {
        //         return d.x > panelSize / 2 ? "6px" : "-6px";
        //     },
        //     dy: function(d) {
        //         return d.y > panelSize * .6 ? "6px" : "-6px";
        //     }
        // }).text(function(d) {
        //     return d.name;
        // });

        
        setTimeout(function(){
            var n = 100000;
            for(var i = n; i>0; --i){

                force.tick();
            }

            force.stop();

            // Links
            if (config.drawLinks) {
                var links = root.selectAll(".link").data(linksData).enter().append("line").classed("link", true);
            }

            //绘制数据点，添加鼠标事件显示隶属度条
            var nodes = root.selectAll("circle.dot")
                        .data(data.sort(function(a,b){
                            return b['classValue'] - a['classValue'];
                        }))
                        .enter()
                        .append("circle")
                        .classed("dot", true)
                        .attr({
                            r: config.dotRadius,
                            fill: function(d) {
                                return config.colorScale(config.colorAccessor(d));
                            },
                            opacity: function(d){
                                return config.opacityAccessor(d);
                            },
                             
                            cx: function(d) {
                                return d.x;
                            },
                            cy: function(d) {
                                return d.y;
                            }
                           
                        })
                        .on("mouseenter", function(d) {
                            if (config.useTooltip) {
                                var mouse = d3.mouse(config.el);
                                tooltip.setText(config.tooltipFormatter(d)).setPosition(mouse[0], mouse[1]).show();
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
                        });
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
    //ci_normalized(i<该数据点所属的聚类个数)为每个隶属度占总隶属度的比例(一个数据点的总隶属度和为1，即数据表中的每行和为1)
    //是每个聚类对该数据点的弹簧拉力大小
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
        setPosition: position,
        show: show,
        hide: hide
    };
};


