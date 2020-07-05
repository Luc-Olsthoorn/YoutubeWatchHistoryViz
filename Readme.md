## Youtube Watch History Visualization

This is a little something I whipped together to visualize the history of my youtube.

![](example.gif)

### Usage

1. Use https://github.com/zvodd/Youtube-Watch-History-Scraper to scrape your watch history

2. Get the output '`history.csv`' and put it in the `YoutubeWatchHistory/history.csv`

3. In YoutubeWatchHistory run `npm install`

4. In YoutubeWatchHistory run `node index.js` -- this manipulates the data for the frontend and is exported to build/data.json

5. Open `YoutubeWatchHistory/build/index.html` in browser

### Libraries

https://materializecss.com/

https://d3js.org/

https://www.npmjs.com/package/csvtojson

### Known issues

#### Doesn't account for actual timewatched.

The current scraper doesn't scrape the time watched, so unfortunately the estimates are not perfect for time watched. I cut any video in the data manipulation out that was over 2 hours long

#### Code is not good

This was me not caring about coding standards or anything, just trying to make it look good lol, so if you are looking to extend it be wary of that.

#### Generated Data.json is absolutely massive

The data.json for me is about 100mb which is absolutely huge. Might write something to reduce the data size, but just wanted to get it out the door
