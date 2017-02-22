function renderArcs(classes){

    var svg = d3.select("svg");

    var tip = d3.tip()
        .attr("class","d3-tip")
        .offset([-10,0])
        .html(function(d){
            return "<strong>Numbers:</strong> <span style='color:red'>" + d.value + "</span>";
        })

    svg.call(tip);

	 // classes.forEach(function(meta){

  //       meta.C1 = parseFloat(meta.C1)
  //       meta.C2 = parseFloat(meta.C2)
  //       meta.C3 = parseFloat(meta.C3)
  //       meta.C4 = parseFloat(meta.C4)

  //   })

	var PI = Math.PI;
    var arcMin = 105;        // inner radius of the first arc
    var arcWidth = 120;      // width
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
        .attr("transform", "translate(400,400)")
        .attr("class","arcs")

    // *** update existing arcs -- redraw them ***
    arcs.attr("d", drawArc)
        .attr("fill", '#ccc')
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
            .attr("transform", "translate(400,400)")
            .attr("class","hists")

        // *** update existing arcs -- redraw them ***
        hists.attr("d", drawHist)
            .attr("fill", 'steelblue')
            .attr('stroke','none')
            .on("mouseover",tip.show)
            .on("mouseout",tip.hide)

        console.log(reducedData);
        // console.log(classes);

        counter += 1;
    })

}