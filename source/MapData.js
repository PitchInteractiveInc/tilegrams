import usTopoJson from '../maps/us-counties-20m.topo.json'
import fipsToCounty from '../data/fips-to-county.json'

const OBJECT_ID = 'counties'

class MapData {
  constructor(topoJson) {
    this._topoJson = topoJson
  }

  getObjectId() {
    return OBJECT_ID
  }

  getTopoJson() {
    return this._topoJson
  }

  getGeometries() {
    return this._topoJson.objects[OBJECT_ID].geometries
  }

  getCountyGeometriesForState(stateCode) {
    return this.getGeometries().filter(geometry => {
      const county = fipsToCounty[geometry.id]
      return county !== undefined && county.state === stateCode
    })
  }

  getUniqueFeatureIds() {
    return [...new Set(this.getCountyGeometriesForState('CA').map((feature) => feature.id))]
  }
}

export default new MapData(usTopoJson)
