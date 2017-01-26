import worldTopoJson from '../../maps/world.topo.json'
import usTopoJson from '../../maps/us-110m.topo.json'
import ukConstituencyTopoJson from '../../maps/uk-constituency.topo.json'
import MapResource from './MapResource'

class GeographyResource {
  constructor() {
    this._geographies = [
      {
        label: 'United States',
        mapResource: new MapResource(usTopoJson, 'states'),
      },
      {
        label: 'United Kingdom - Constituencies',
        mapResource: new MapResource(ukConstituencyTopoJson, 'constituencies'),
      },
      {
        label: 'World',
        mapResource: new MapResource(worldTopoJson, 'countries'),
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
