const fs = require('fs');
const topojson = require('./node_modules/topojson-client');

const topoData = JSON.parse(fs.readFileSync('./public/data/countries-110m.json', 'utf8'));
const geoData = topojson.feature(topoData, topoData.objects.countries);

fs.writeFileSync('d:/social_media_research/public/data/world-low.json', JSON.stringify(geoData));
console.log("Successfully converted TopoJSON to GeoJSON! Size:", fs.statSync('d:/social_media_research/public/data/world-low.json').size);
