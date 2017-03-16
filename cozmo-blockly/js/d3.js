
var n = 40,
    random = d3.randomNormal(0, .2),
    d3X = d3.range(n).map(random),
    d3Y = d3.range(n).map(random),
    d3Z = d3.range(n).map(random);
var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var x = d3.scaleLinear()
    .domain([0, n - 1])
    .range([0, width]);
var y = d3.scaleLinear()
    .domain([-1, 1])
    .range([height, 0]);
var line = d3.line()
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });
g.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);
g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + y(0) + ")")
    .call(d3.axisBottom(x));
g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y));
g.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    // .datum(data)
    .datum(d3X)
    .attr("class", "line")
    .style("stroke", "#000");
g.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    // .datum(data)
    .datum(d3Y)
    .attr("class", "line")
    .style("stroke", "#500");
g.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    // .datum(data)
    .datum(d3Z)
    .attr("class", "line")
    .style("stroke", "#050");
  // .transition()
  //   .duration(100)
  //   .ease(d3.easeLinear);
    // .on("start", tick);
function tick(xx, yy, zz) {
  // Push a new data point onto the back.
  // data.push(random());
  d3X.push(xx);
  d3Y.push(yy);
  d3Z.push(zz);
  // console.log(xx, yy, zz);
  // Redraw the line.
  d3.selectAll('.line')
      .attr("d", line)
      .attr("transform", null);
  // Slide it to the left.
  d3.selectAll('.line')
    .transition()
    .attr("transform", "translate(" + x(-1) + ",0)")
    .duration(100)
    .ease(d3.easeLinear);
  // d3.active(graph)
  //     .attr("transform", "translate(" + x(-1) + ",0)")
  //   .transition();
      // .on("start", tick);
  // Pop the old data point off the front.
  d3X.shift();
  d3Y.shift();
  d3Z.shift();
}
