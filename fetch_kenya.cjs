const https = require('https');
const fs = require('fs');

https.get('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const geo = JSON.parse(data);
      const kenya = geo.features.find(f => f.properties.ADMIN === 'Kenya' || f.properties.ISO_A3 === 'KEN');
      if (kenya) {
        fs.writeFileSync('c:/Users/Winstone/Downloads/Antigravity/portfolio-react/public/kenya.json', JSON.stringify({ type: "FeatureCollection", features: [kenya] }));
        console.log('Kenya GeoJSON saved successfully.');
      } else {
        console.log('Kenya not found in GeoJSON.');
      }
    } catch (e) {
      console.log('Error parsing JSON', e);
    }
  });
}).on('error', (e) => {
  console.error(e);
});
