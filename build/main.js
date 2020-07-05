
fetch('/data').then(response => response.json()).then((data)=>{
  generateTotalVideos(data);

  data = clean(data);



  const watchedDaily = generateWatchedDaily(data);
  generateChart(watchedDaily);

  generateTimeWatched(data);

  const channelOverTime = generateChannelOverTime(data);
  mostWatchedChannelsData = sortAndReduceChannelOverTime(channelOverTime);
  generateChannelOverTimeTimeWatchedChart();


  const topTotal = generateMostWatchedChannels(channelOverTime);
  generateMostWatchedChannelsList(topTotal);


  const channelOverTimeVideos = generateChannelOverTimeVideos(data);
  mostWatchedChannelsVideosData = sortAndReduceChannelOverTime(channelOverTimeVideos);
  generateChannelOverTimeVideosChart();

  document.getElementById('loading').style.display = 'none';
  document.getElementById('graphs').style.visibility = 'visible';
});
const clean = (data) => {
  data = data.filter(o=>o.date.includes(' ')); //remove yesterday today etc
  data = data.map(elem=>{
    if(elem.date.length<7){
      currentYear = new Date().getFullYear();
      elem.date+=`, ${currentYear}`
    }
    return elem;
  })
  return data.filter(o=>o.time<7000);
}
const generateTimeWatched = (data)=>{
  let totalTimeWatched = data.reduce((a, b) => a + parseInt(b.time), 0);
  document.getElementById('totalTime').innerHTML = secondsToDhms(totalTimeWatched);
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

//stolen from https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    var newList = [];
    map.forEach((val, key)=>{
        newList.push({ key: key, value: val });
    });
    return newList;
}

const generateWatchedDaily = (data)=>{
  let groupByDate = groupBy(data,  o => o.date);
  let timeWatchedPerDay = groupByDate.map((elem)=>{
    elem.value = elem.value.reduce((a, b) => a + parseInt(b.time), 0);
    elem.key = new Date(elem.key);
    return elem;
  })
  timeWatchedPerDay = timeWatchedPerDay.sort(function(a,b){
    return new Date(b.key) - new Date(a.key);
  });

  let allDates = [];
  let dateIncrement = 0;
  var date = new Date(timeWatchedPerDay[dateIncrement].key);
  while(dateIncrement < timeWatchedPerDay.length){
    if(timeWatchedPerDay[dateIncrement].key.getTime() === date.getTime()){
      allDates.push(timeWatchedPerDay[dateIncrement])
      dateIncrement++;
    }else{
      allDates.push({key: new Date(date.getTime()), value:0})
    }
    date.setDate(date.getDate() - 1);
  }
  return allDates;
}

const generateChannelOverTime = (data) =>{
  let groupByDate = groupBy(data,  o => o.date);
  groupByDate = groupByDate.sort(function(a,b){
    return new Date(a.key) - new Date(b.key);
  });
  groupByDate = groupByDate.map((elem)=>{
    elem.key = new Date(elem.key);
    return elem;
  })
  let allDates = [];
  let dateIncrement = 0;
  var date = new Date(groupByDate[dateIncrement].key);
  while(dateIncrement < groupByDate.length){
    if(groupByDate[dateIncrement].key.getTime() === date.getTime()){
      allDates.push(groupByDate[dateIncrement])
      dateIncrement++;
    }else{
      allDates.push({key: new Date(date.getTime()), value:0})
    }
    date.setDate(date.getDate() + 1);
  }
  var channelOverTime = [];
  var lastDay = {}
  for(elem of allDates){
    let ranking = {};
    Object.assign(ranking, lastDay);
    if(elem.value){
      elem.value.forEach((video)=>{
        ranking[video.channel] = ranking[video.channel] || 0;
        ranking[video.channel] += parseInt(video.time);
      })
    }
    lastDay = ranking;
    channelOverTime.push( {
      date:elem.key,
      ranking: ranking,
    })
  }
  return channelOverTime;
}
const generateChannelOverTimeVideos = (data) =>{
  let groupByDate = groupBy(data,  o => o.date);
  groupByDate = groupByDate.sort(function(a,b){
    return new Date(a.key) - new Date(b.key);
  });
  groupByDate = groupByDate.map((elem)=>{
    elem.key = new Date(elem.key);
    return elem;
  })
  let allDates = [];
  let dateIncrement = 0;
  var date = new Date(groupByDate[dateIncrement].key);
  while(dateIncrement < groupByDate.length){
    if(groupByDate[dateIncrement].key.getTime() === date.getTime()){
      allDates.push(groupByDate[dateIncrement])
      dateIncrement++;
    }else{
      allDates.push({key: new Date(date.getTime()), value:0})
    }
    date.setDate(date.getDate() + 1);
  }
  var channelOverTimeVideos = [];
  var lastDay = {}
  for(elem of allDates){
    let ranking = {};
    Object.assign(ranking, lastDay);
    if(elem.value){
      elem.value.forEach((video)=>{
        ranking[video.channel] = ranking[video.channel] || 0;
        ranking[video.channel] += 1;
      })
    }
    lastDay = ranking;
    channelOverTimeVideos.push( {
      date:elem.key,
      ranking: ranking,
    })
  }
  return channelOverTimeVideos;
}

const sortAndReduceChannelOverTime=(channelOverTime)=>{
  return channelOverTime.map((elem)=>{
    var mostWatchedChannels = [];
    for (let [channel, timeWatched] of Object.entries(elem.ranking)){
        mostWatchedChannels.push({ channel: channel, timeWatched: timeWatched });
    }
    mostWatchedChannels = mostWatchedChannels.sort((a,b)=>b.timeWatched-a.timeWatched);
    mostWatchedChannels = mostWatchedChannels.slice(0,12);
    return {
      date: elem.date,
      ranking: mostWatchedChannels
    }
  })
}

const generateMostWatchedChannels = (channelOverTime) =>{
  var mostWatchedChannels = [];

  for (let [channel, timeWatched] of Object.entries(channelOverTime[channelOverTime.length-1].ranking)){
      mostWatchedChannels.push({ channel: channel, timeWatched: timeWatched });
  }
  mostWatchedChannels = mostWatchedChannels.sort((a,b)=>b.timeWatched-a.timeWatched);
  return mostWatchedChannels;
}
