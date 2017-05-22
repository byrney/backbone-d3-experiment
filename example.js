
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

    // called by backbone when the data in the model changes
    modelUpdated: function(){
        var counts = this.model.get('characters');
        this.frequencyChart(counts.sort( (a, b) => a.x.localeCompare(b.x)));
    },

    frequencyChart: function(counts){
        var data = this.model.attributes.characters;
        var margins = {top: 30, bottom: 30, left: 30, right: 0};
        var height = (280 - margins.top - margins.bottom), width = (600 - margins.left - margins.right);
        //Axis to turn space into [ ] only for the drawn axis 
        var xAxis  = d3.scaleBand()
                .domain(data.map(d => d.x))
                .range([0, width]); 
        var yAxis = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.y)])
                .range([height, 0]);
        var totalCount = d3.sum(counts, (d) => d.y);
        var chart = d3.select(this.el ).attr("transform", "translate(" + margins.left + "," + margins.top + ")");
        chart.selectAll('rect').attr('class', '');
        var updated = chart.selectAll('rect').data(counts, (d) => d.x);
        var updatedText = chart.selectAll('text').data(counts, (d) => d.x);
        //Add x-axis
        chart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xAxis))
            ;
        //Add y-Axis
        chart.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yAxis))
            ;
        //Removing ticks for now, as not updating correctly 
        chart.selectAll('.tick line')
            .remove()
        // all bars need updating when the totals change because the colors
        // are relative
        this.dataUpdated(updated, totalCount, height, width, xAxis, yAxis, updatedText)
        // bars which are being added
        this.dataAdded(updated.enter(), totalCount, data, height, width, xAxis, yAxis, updatedText.enter());
        // bars which are leaving the chart fade then remove the rect
        this.dataRemoved(updated.exit());
        this.dataRemoved(updatedText.exit());
        updated.order();
        updatedText.order();
    },

    // called when data is added to d3
    dataAdded: function(added, totalCount, data, height, width, xAxis, yAxis, updatedText){
        added.append('rect')
            .attr('x',  d => {return xAxis(d.x)})
            .attr('y', d =>{ return yAxis(d.y) })
            .attr('width', ( width / (data.map(function(d){return d.x})).length))
            .attr('height', d => { return (height - yAxis(d.y))})
            .attr('fill', (d)=> {
                return d.y == 0 ? '#eee' : this.barColor(d.y / totalCount)
            })
        ;
        updatedText.append('text')
            .attr('x', d=> {return xAxis(d.x) + width / (data.map(function(d){return d.x})).length / 2 }) 
            .attr('y',  d =>{ return yAxis(d.y) })
            .attr('dy', '.50em')
            .attr('dx', '-0.25em' )
            .text(d => d.x == ' ' ? '[ ]' : d.x)
        ;
        },

    // called with the updated bars when data is changed
    dataUpdated: function(updated, totalCount, height, width, xAxis, yAxis, updatedText){
        var data = this.model.attributes.characters;
        updated.transition()
            .duration(200)
            .attr("fill", (d)=> {
                return d.y == 0 ? '#eee' : this.barColor(d.y / totalCount)
            })
            .attr('x',  d => {return xAxis(d.x)})
            .attr('y', d =>{ return yAxis(d.y)})
            .attr('height', d => { return (height - yAxis(d.y))})
            .attr('width', ( width / (data.map(function(d){return d.x})).length))
        ;
        updatedText
            .transition()
            .duration(200)
            .attr('x', d=> {return xAxis(d.x) + width / (data.map(function(d){return d.x})).length / 2 }) 
            .attr('y',  d =>{ return yAxis(d.y) })
            .attr('dy', '.50em')
            .attr('dx', '-0.25em')
            ;
    },

    // called when data is removed from d3
    dataRemoved: function(exit){
        exit
            .transition().duration(1000).attr("opacity", '0')
            .remove()
        ;
    },

});


let EditView = Backbone.View.extend({

    initialize: function(options){
        console.log('editview.initialize', this.el);
        // trigger an update with the initial text in the control
        this.model.contentUpdated(this.el.value);
    },

    events: {
        'keyup': 'textKeyUp'
    },

    // called when text is entered into the control
    textKeyUp: function(e){
        this.model.contentUpdated(this.el.value);
    }

});

function main(){
    var model = new Model();
    var chart = new ChartView({
        model: model,
        el: '#chart svg'
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
