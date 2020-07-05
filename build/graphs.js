const main = () => {
  let data = window.data;



  generateChart(data.watchedDaily);

  generateTimeWatched(data.timeWatched);
  generateTotalVideos(data.totalVideos);

  generateChannelOverTimeTimeWatchedChart(); // no data passed as its stored in a global var that can be referenced on click

  generateMostWatchedChannelsList(data.mostWatchedChannelsTop);

  generateChannelOverTimeVideosChart();

  document.getElementById('loading').style.display = 'none';
  document.getElementById('graphs').style.visibility = 'visible';
}


const generateChart = (data) =>{
  data = data.map(o=>{
    let date = new Date(o.key)
    return {
      ...o,
      key: date
    }
  })
  var height  = 500;
  var width   = 100000;
  var hEach   = 40;

  var margin = {top: 20, right: 15, bottom: 25, left: 25};

  width =     width - margin.left - margin.right;
  height =    height - margin.top - margin.bottom;

  var svg = d3.select('#watchOverTime').append("svg")
  .attr("width",  width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the ranges
  var x = d3.scaleTime().range([0, width]);

  x.domain(d3.extent(data, function(d) { return d.key; }));


  var y = d3.scaleLinear().range([height, 0]);


  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  var valueline = d3.line()
          .x(function(d) { return x(d.key); })
          .y(function(d) { return y(d.value);  })
          .curve(d3.curveMonotoneX);

  svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline);

  //  var xAxis_woy = d3.axisBottom(x).tickFormat(d3.timeFormat("Week %V"));
  var xAxis_woy = d3.axisBottom(x).ticks(11).tickFormat(d3.timeFormat("%y-%b-%d")).tickValues(data.map(d=>d.key));

  svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis_woy);
}

//stolen from https://stackoverflow.com/questions/36098913/convert-seconds-to-days-hours-minutes-and-seconds
function secondsToDhms(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600*24));
  var h = Math.floor(seconds % (3600*24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}


const generateMostWatchedChannelsList = (mostWatchedChannels) =>{

  let output = mostWatchedChannels.map((elem, key)=>{
    return `<li style="color:white; padding-top:5px; padding-bottom:5px;">${key+1}. <b>${elem.channel}</b> <span style="float:right;">${secondsToDhms(elem.timeWatched)}</span></li>`;
  });
  document.getElementById('channelsList').innerHTML=output.join(" ");
}

const generateTotalVideos = (data) =>{
  document.getElementById('numVideos').innerHTML=data;
}
const generateTimeWatched = (data)=>{
  document.getElementById('totalTime').innerHTML = secondsToDhms(data);
}
const generateChannelOverTimeVideosChart = () =>{
  generateBarChart( window.data.mostWatchedChannelsVideosData, 'channelsOverTimeVideos');
}
const generateChannelOverTimeTimeWatchedChart = () =>{
   window.data.mostWatchedChannelsData.forEach((o)=>{
    o.ranking.forEach((p)=>{
      p = Math.floor(p/60)
    })
  })
  generateBarChart( window.data.mostWatchedChannelsData, 'channelsOverTime');
}
const generateBarChart = (data, element) =>{
  const colorArray= [
    '#e53935',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00acc1',
    '#4caf50',
    '#8bc34a',
    '#ffc107',
    '#ffeb3b',
    '#ff9800',
    '#ff5722',
  ]
  const containerWidth = document.getElementById(element).offsetWidth;
  d3.select("#"+element+' > svg').remove();
  var svg = d3.select("#"+element).append("svg")
    .attr("width", containerWidth)
    .attr("height", 500);
  var tickDuration = 100;

  var top_n = 12;
  var height = 500;
  var width = containerWidth;

  const margin = {
    top: 0,
    right: 0,
    bottom: 5,
    left: 0
  };

  let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);


   let date = new Date(data[0].date);


   let firstEntry = data[0].ranking;
   firstEntry.map((o,key)=>o.rank = key);
   firstEntry.map((o,key)=>o.color = colorArray[Math.floor(Math.random() * colorArray.length)]);

   let x = d3.scaleLinear()
      .domain([0, d3.max(firstEntry, o => o.timeWatched)])
      .range([margin.left, width-margin.right-65]);

   let y = d3.scaleLinear()
      .domain([top_n, 0])
      .range([height-margin.bottom, margin.top]);

   let xAxis = d3.axisTop()
      .scale(x)
      .ticks(width > 500 ? 5:2)
      .tickSize(-(height-margin.top-margin.bottom))
      .tickFormat(d => d3.format(',')(d));

   svg.append('g')
     .attr('class', 'axis xAxis')
     .attr('transform', `translate(0, ${margin.top})`)
     .call(xAxis)
     .selectAll('.tick line')
     .classed('origin', d => d == 0);

   svg.selectAll('rect.bar')
      .data(firstEntry, d => d.channel)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', x(0)+1)
      .attr('width', d => x(d.timeWatched)-x(0)-1)
      .attr('y', d => y(d.rank)+5)
      .attr('height', y(1)-y(0)-barPadding)
      .style('fill', d => d.color);

   svg.selectAll('text.label')
      .data(firstEntry, d => d.channel)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.timeWatched)-8)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
      .style('fill', 'white')
      .style( 'stroke','white')
      .style('text-anchor', 'end')
      .html(d => d.channel);



  svg.selectAll('text.valueLabel')
    .data(firstEntry, d => d.channel)
    .enter()
    .append('text')
    .attr('class', 'valueLabel')
    .attr('x', d => x(d.timeWatched)+5)
    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
    .style('fill', '#9e9e9e')
    .style( 'stroke','#9e9e9e')
    .text(d => d3.format(',.0f')(d.timeWatched));


  let yearText = svg.append('text')
    .attr('class', 'yearText')
    .attr('x', width-margin.right)
    .attr('y', height-25)
    .style('text-anchor', 'end')
    .style('fill', '#9e9e9e')
    .style( 'stroke','#9e9e9e')
    .html(date.toLocaleDateString("en-US"));

 let index = 0;
 let ticker = d3.interval(e => {
    let entry = data[index];
    let date = new Date(entry.date);
    entry.ranking.forEach((o,key)=>o.rank = key);
    entry.ranking.forEach((o,key)=>o.color = colorArray[Math.floor(Math.random() * colorArray.length)]);
    entry.ranking.forEach((o,key)=>{
      try{
        o.lastTimeWatched= data[index-1].ranking.find(p=>p.channel===o.channel).timeWatched
      }catch(err){
        o.lastTimeWatched = 0;
      }
    });
    //console.log('IntervalYear: ', yearSlice);

    x.domain([0, d3.max(entry.ranking, d => d.timeWatched)]);

    svg.select('.xAxis')
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .call(xAxis);

     let bars = svg.selectAll('.bar').data(entry.ranking, d => d.channel);

     bars
      .enter()
      .append('rect')
      .attr('class', d => `bar ${d.channel.replace(/\s/g,'_')}`)
      .attr('x', x(0)+1)
      .attr( 'width', d => x(d.timeWatched)-x(0)-1)
      .attr('y', d => y(top_n+1)+5)
      .attr('height', y(1)-y(0)-barPadding)
      .style('fill', d => d.color)
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank)+5);

     bars
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.timeWatched)-x(0)-1)
        .attr('y', d => y(d.rank)+5);

     bars
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('width', d => x(d.timeWatched)-x(0)-1)
        .attr('y', d => y(top_n+1)+5)
        .remove();

     let labels = svg.selectAll('.label')
        .data(entry.ranking, d => d.channel);

     labels
      .enter()
      .append('text')
      .attr('class', 'label')
      .style('fill', 'white')
      .style( 'stroke','white')
      .attr('x', d => x(d.timeWatched)-8)
      .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
      .style('text-anchor', 'end')
      .html(d => d.channel)
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);


     labels
        .transition()
        .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.timeWatched)-8)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

     labels
        .exit()
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.timeWatched)-8)
          .attr('y', d => y(top_n+1)+5)
          .remove();

     let valueLabels = svg.selectAll('.valueLabel').data(entry.ranking, d => d.channel);

     valueLabels
        .enter()
        .append('text')
        .attr('class', 'valueLabel')
        .style('fill', '#9e9e9e')
        .style( 'stroke','#9e9e9e')
        .attr('x', d => x(d.timeWatched)+5)
        .attr('y', d => y(top_n+1)+5)
        .text(d => d3.format(',.0f')(d.lastTimeWatched))
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

     valueLabels
        .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.timeWatched)+5)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
          .tween("text", function(d) {
             let i = d3.interpolateRound(d.lastTimeWatched, d.timeWatched);
             return function(t) {
               this.textContent = d3.format(',')(i(t));
            };
          });


    valueLabels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.timeWatched)+5)
        .attr('y', d => y(top_n+1)+5)
        .remove();
    yearText.html(date.toLocaleDateString("en-US"));

   if(index == data.length-1) ticker.stop();
   index++;
 },tickDuration);

};

main();
