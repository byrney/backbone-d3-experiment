

function example2(data){
    var max = d3.max(data, (d) => d.y);
    var sum = d3.sum(data, (d) => d.y);
    var height = 500;
    var colorMap = d3.interpolateRgb( d3.rgb('#d6e685'), d3.rgb('#1e6823'));
    var chart = d3.select('#chart')
    chart.selectAll('div').attr('class', '');
    var updated = chart.selectAll("div").data(data, (d) => d.x);
    updated.attr('class', 'update');
    updated.transition().duration(1000)
        .style("background-color", (d)=> {
            return d.y == 0 ? '#eee' : colorMap(d.y / sum)
        })
        .style("height", (d) => d.y / 15 * height + "px")
    ;
    updated.exit().transition().duration(500).style("opacity", '0').remove();
    updated.enter()
        .append("div")
        .style("width", '20px')
        .style('bottom', '0px')
        .style('overflow', 'hidden')
        .style('color', 'white')
        .html(d => d.x == ' ' ? '[ ]' : d.x)
        .style("background-color", (d)=> {
            return d.y == 0 ? '#eee' : colorMap(d.y / sum)
        })
        .style("height", function(d){return d.y / 15 * height + "px"})
    ;
    updated.order();
}

var alpha = "abcdefghijklmnopqrstuvwxyz".split("");

var data = {}; //_.map(alpha, function(ch){return {x: ch, y: Math.random() * 10}});

function change() {
    var keys = d3.shuffle(alpha).slice(0, alpha.length/7);
    for(i = 0; i < keys.length ; i++){
        data[keys[i]] =  Math.random() * 10;
    }
    var arr = _.reduce(data, (m, v, i) => { m.push({x: i, y: v}) ; return m;}, [])
    example2(arr.sort( (a, b) => a.x.localeCompare(b.x)));
}

function updateChart(content){
    var charArr = content.split("");
    var data = _.reduce(charArr, (memo, value) => {
        var ch = /\s/.test(value) ? ' ' : value;
        if(!memo[ch]){
            memo[ch] = 0;
        }
        memo[ch] += 1;
        return memo;
    }, {});
    var arr = _.reduce(data, (m, v, i) => { m.push({x: i, y: v}) ; return m;}, [])
    example2(arr.sort( (a, b) => a.x.localeCompare(b.x)));
}

var deferedUpdate = _.debounce(updateChart, 200);

function keyup(e){
    //console.log(e);
    var src = e.srcElement;
    var content = src.value;
    deferedUpdate(content);
}

function go(){
    example2([]);
    var textArea = document.getElementById('text');
    textArea.onkeyup = keyup;
    updateChart(textArea.value);
    //setInterval(change, 999);
}

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(go);
