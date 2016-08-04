

function example1(data){
    d3.select('#chart')
    .selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .style("height", (d)=> d.y + "px")
}

function format(selection){
    selection
        .style("background-color", (d)=> {
            return d.y == 0 ? '#eee' : colorMap(d.y / max)
        })
        .style("width", '20px')
        .style("height", function(d){return d.y / 15 * height + "px"})
        .style('bottom', '0px')
}

function example2(data){
    var max = 10; //d3.max(data, (d) => d.y);
    var height = 500;
    var colorMap = d3.interpolateRgb( d3.rgb('#d6e685'), d3.rgb('#1e6823'));
    var chart = d3.select('#chart')
    chart.selectAll('div').attr('class', '');
    var points = chart.selectAll("div").data(data, (d) => d.x);
    points.attr('class', 'update');
    points.transition().duration(1000)
        .style("background-color", (d)=> {
            return d.y == 0 ? '#eee' : colorMap(d.y / max)
        })
        .style("height", (d) => d.y / 15 * height + "px")
    ;
    points.enter()
        .append("div")
        .style("background-color", (d)=> {
            return d.y == 0 ? '#eee' : colorMap(d.y / max)
        })
        .style("width", '20px')
        .style("height", function(d){return d.y / 15 * height + "px"})
        .style('bottom', '0px')
    ;
    // var update = chart.selectAll('div').data(data.slice(-2), (d) => d.x);
    // update.exit().remove();
}

var alpha = "abcdefghijklmnopqrstuvwxyz".split("");

var data = _.map(alpha, function(ch){return {x: ch, y: Math.random() * 10}});

function change() {
    var mixed = d3.shuffle(data);
    for(i = 0; i < data.length / 5; i++){
        data[i].y = Math.random() * 10;
        if(data[i].y > 9.1 ){
            data[i].y = 1;
        }
    }
    example2(mixed);
}

function go(){
    example2(data);
    setInterval(change, 999);
}

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(go);
