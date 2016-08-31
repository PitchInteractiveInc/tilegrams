import usTopoJson from '../maps/us-110m.topo.json'

const OBJECT_ID = 'states'

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

  getUniqueFeatureIds() {
    const geometries = this._topoJson.objects[OBJECT_ID].geometries
    return [...new Set(geometries.map((feature) => feature.id))]
  }
}

export default new MapData(usTopoJson)
