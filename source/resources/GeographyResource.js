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

  getMapResource(label) {
    return this._geographies.find(geography => geography.label === label).mapResource
  }

  getGeographies() {
    return this._geographies
  }
}

export default new GeographyResource()
