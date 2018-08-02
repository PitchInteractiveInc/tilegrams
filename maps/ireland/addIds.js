const topo = require('./Irish_Constituencies.topo.json');
const objects = topo.objects.Irish_Constituencies.geometries

objects.forEach(obj => {
  const id = obj.properties.Constituency
  obj.id = id
})

console.log(JSON.stringify(topo))

