class MapResource {
  constructor(topoJson, objectId) {
    this._topoJson = topoJson
    this._objectId = objectId
    //
     if (!this._topoJson.objects[this._objectId].geometries[0].id) {
      this.mockIdField();
    }
    //
  }

  //
  mockIdField() {
    for (let i = 0; i < this._topoJson.objects[this._objectId].geometries.length; i++) {
      const s = this._topoJson.objects[this._objectId].geometries[i].properties.NA_Cons.split('-');
      this._topoJson.objects[this._objectId].geometries[i].id = s[1].toString();
        // this._topoJson.objects[this._objectId].geometries[i].properties.id
    }
    console.log(this._topoJson)
  }
  //

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
