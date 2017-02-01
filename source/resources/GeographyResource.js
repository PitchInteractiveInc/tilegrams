import worldTopoJson from '../../maps/world.topo.json'
import usTopoJson from '../../maps/us-110m.topo.json'
import ukConstituencyTopoJson from '../../maps/uk-constituency.topo.json'
import MapResource from './MapResource'
import fipsHash from '../../data/fips-to-state.json'
import fidHash from '../../data/fid-to-constituency.json'
import isoHash from '../../data/isoa3-to-name.json'

class GeographyResource {
  constructor() {
    this._geographies = [
      {
        label: 'United States',
        mapResource: new MapResource(usTopoJson, 'states'),
        geoCodeToName: fipsHash,
      },
      {
        label: 'United Kingdom - Constituencies',
        mapResource: new MapResource(ukConstituencyTopoJson, 'constituencies'),
        geoCodeToName: fidHash,
      },
      {
        label: 'World',
        mapResource: new MapResource(worldTopoJson, 'countries'),
        geoCodeToName: isoHash,
      },
    ]
  }

  getMapResource(label) {
    return this._geographies.find(geography => geography.label === label).mapResource
  }

  getGeographies() {
    return this._geographies
  }

  getGeoCodeHash(label) {
    return this._geographies.find(geography => geography.label === label).geoCodeToName
  }
}

export default new GeographyResource()
