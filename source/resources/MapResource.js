class MapResource {
  constructor(topoJson, objectId) {
    this._topoJson = topoJson
    this._objectId = objectId
  }

  getObjectId() {
    return this._objectId
  }

  getTopoJson() {
    return this._topoJson
  }

  getGeometries() {
    return this._topoJson.objects[this._objectId].geometries
  }

  getUniqueFeatureIds() {
    return [...new Set(this.getGeometries().map((feature) => feature.id))]
  }
}

export default MapResource
