const fs = require('fs');

const filePath = './history.csv';

const csv=require("csvtojson");
const {buildVizJson} = require('./dataManipulation.js');


const main = async () => {
  const json = await csv().fromFile(filePath);
  const viz = buildVizJson(json)
  const stringJson = JSON.stringify(viz);
  const output = `data = ${stringJson}`
  fs.writeFileSync('./build/data.json', output);

  console.log("done building");
}
main();
