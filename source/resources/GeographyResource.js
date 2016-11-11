import WorldMapResource from './WorldMapResource'
import USMapResource from './USMapResource'

class GeographyResource {
  constructor() {
    this._geographies = [
      {
        label: 'United States',
        mapResource: USMapResource,
      },
      {
        label: 'World',
        mapResource: WorldMapResource,
      },
    ]
  }

  getGeographies() {
    return this._geographies
  }
}

export default new GeographyResource()
