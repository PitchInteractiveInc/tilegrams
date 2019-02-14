const topo = require('./india.topo.json');
const objects = topo.objects.india.geometries

const multiPolygonsToFix = ['S29', 'S26', 'S28', 'S23', 'S05', 'S21', 'S04', 'S16', 'S07', 'S27',
  'S10', 'S02', 'S20', 'S15', 'S08', 'S17', 'S18', 'S14', 'S09', 'U02', 'S03', 'S13',
  'S11', 'U05', 'S19', 'S25', 'S12']

objects.forEach(obj => {
  obj.id = obj.properties.ST_CODE

  if (multiPolygonsToFix.includes(obj.id) && obj.type === 'MultiPolygon') {
    obj.type = 'Polygon';
    obj.arcs[0] = obj.arcs[0][0]
  }
})


console.log(JSON.stringify(topo))

