const https = require('https');
const fs = require('fs');

https.get('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const geo = JSON.parse(data);
      fs.writeFileSync('c:/Users/Winstone/Downloads/Antigravity/portfolio-react/all_countries.json', data);
      console.log('All countries saved. Length:', geo.features.length);
      console.log('Sample properties:', geo.features[0].properties);
    } catch (e) {
      console.log('Error parsing JSON', e);
    }
  });
}).on('error', (e) => {
  console.error(e);
});
