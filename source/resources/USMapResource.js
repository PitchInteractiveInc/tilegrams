import usTopoJson from '../../maps/us-110m.topo.json'

const OBJECT_ID = 'states'

class USMapResource {
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

  getUniqueFeatureIds() {
    return [...new Set(this.getGeometries().map((feature) => feature.id))]
  }
}

export default new USMapResource(usTopoJson)
