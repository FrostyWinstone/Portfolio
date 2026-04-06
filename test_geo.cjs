const fs = require('fs');

try {
  let raw = fs.readFileSync('public/world.json', 'utf8');
  console.log("Raw size", raw.length);
  const geoData = JSON.parse(raw);
  console.log("Features length", geoData?.features?.length);
  const radius = 1.6;

  function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return {x, y, z};
  }

  const worldPositions = [];
  const kenyaPositions = [];

  const addPolygon = (ring, isKenya) => {
    for (let i = 0; i < ring.length - 1; i++) {
        const p1 = latLngToVector3(ring[i][1], ring[i][0], radius);
        const p2 = latLngToVector3(ring[i+1][1], ring[i+1][0], radius);
        if (isKenya) {
          kenyaPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        } else {
          worldPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
    }
  };

  geoData.features.forEach((feature, index) => {
    const isKenya = feature.properties.name === 'Kenya' || feature.properties.ADMIN === 'Kenya';
    if (feature.geometry && feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach(ring => addPolygon(ring, isKenya));
    } else if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(poly => poly.forEach(ring => addPolygon(ring, isKenya)));
    }
  });

  console.log("Success! World positions:", worldPositions.length, "Kenya positions:", kenyaPositions.length);
} catch (e) {
  console.error("Crash!", e);
}
