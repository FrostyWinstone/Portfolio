const fs = require('fs');
const geo = JSON.parse(fs.readFileSync('all_countries.json', 'utf8'));
const kenya = geo.features.find(f => f.properties['name'] === 'Kenya' || f.properties['ISO3166-1-Alpha-3'] === 'KEN');
if (kenya) {
  fs.writeFileSync('c:/Users/Winstone/Downloads/Antigravity/portfolio-react/public/kenya.json', JSON.stringify({ type: "FeatureCollection", features: [kenya] }));
  console.log('Saved kenya.json');
} else {
  console.log('Still no Kenya');
}
