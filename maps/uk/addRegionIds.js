const topo = require('./uk_countries_and_england_regions.topo.json');
const objects = topo.objects.uk_countries_and_england_regions.geometries

const multiPolygonsToFix = ['West Midlands', 'London']
objects.forEach(obj => {
  const id1 = obj.properties.EER13NM
  const id2 = obj.properties.NAME_1
  obj.id = id1 || id2
  if (multiPolygonsToFix.includes(obj.id) && obj.type === 'MultiPolygon') {
    obj.type = 'Polygon';
    obj.arcs[0] = obj.arcs[0][0]
  }

})


console.log(JSON.stringify(topo))

