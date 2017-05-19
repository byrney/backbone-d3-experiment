
let Model = Backbone.Model.extend({

    defaults: {
        characters: {}
    },

    initialize: function(data, options){
    },

    contentUpdated: function(content){
        var chars = this.countChars(content);
        this.set({
            characters: chars
        });
    },

    // converts string of chars into frequency
    countChars: function(content){
        var charArr = content.split("");
        var data = _.reduce(charArr, (memo, value) => {
            // put all whitespace chars in the same category
            var ch = /\s/.test(value) ? ' ' : value;
            memo[ch] = memo[ch] ? memo[ch] + 1 : 1;
            return memo;
        }, {});
        var arr = _.reduce(data, (m, v, i) => {
            m.push({ x: i, y: v });
            return m;
        }, [])
        return arr;
    },

});


let ChartView = Backbone.View.extend({

    barColor: d3.interpolateRgb( d3.rgb('#d6e685'), d3.rgb('red')),
    pixelsPerCount: 500 / 15,

    initialize: function(options){
        console.log('chart.initialize', this.el);
        this.lazyUpdate = _.debounce(this.modelUpdated, 200);
        this.listenTo(this.model, 'change', this.lazyUpdate);
    },

    modelUpdated: function(){
        var counts = this.model.get('characters');
        this.frequencyChart(counts.sort( (a, b) => a.x.localeCompare(b.x)));
    },

    // called when the data in the model changes
    frequencyChart: function(counts){
        var totalCount = d3.sum(counts, (d) => d.y);
        var chart = d3.select(this.el);
        chart.selectAll('div').attr('class', '');
        var updated = chart.selectAll("div").data(counts, (d) => d.x);
        this.dataUpdated(updated, totalCount)
        // bars which are being added
        this.dataAdded(updated.enter(), totalCount);
        // bars which are leaving the chart fade then remove the div
        this.dataRemoved(updated.exit());
        updated.order();
    },

    dataAdded: function(added, totalCount){
        added.append("div")
            .style("width", '20px')
            .style('bottom', '0px')
            .style('overflow', 'hidden')
            .style('color', 'white')
            .html(d => d.x == ' ' ? '[ ]' : d.x)
            .style("background-color", (d)=> {
                return d.y == 0 ? '#eee' : this.barColor(d.y / totalCount)
            })
            .style("height", d =>  d.y * this.pixelsPerCount + "px")
        ;
    },

    // called with the updated bars when data is changed
    dataUpdated: function(updated, totalCount){
        // when the totalCount changes the color of all the bars is affected
        updated.transition()
            .duration(200)
            .style("background-color", (d)=> {
                return d.y == 0 ? '#eee' : this.barColor(d.y / totalCount)
            })
            .style("height", d =>  d.y * this.pixelsPerCount + "px")
        ;
    },

    dataRemoved: function(exit){
        exit
            .transition().duration(1000).style("opacity", '0')
            .remove()
        ;
    },

});


let EditView = Backbone.View.extend({

    initialize: function(options){
        console.log('editview.initialize', this.el);
        this.model.contentUpdated(this.el.value);
    },

    events: {
        'keyup': 'textKeyUp'
    },

    textKeyUp: function(e){
        this.model.contentUpdated(this.el.value);
    }

});

function main(){
    var model = new Model();
    var chart = new ChartView({
        model: model,
        el: '#chart'
    });
    var edit = new EditView({
        model: model,
        el: '#text'
    });
}


function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(main);
