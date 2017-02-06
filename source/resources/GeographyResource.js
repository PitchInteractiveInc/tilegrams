import usTopoJson from '../../maps/us-110m.topo.json'
import ukConstituencyTopoJson from '../../maps/uk-constituency.topo.json'
import germanyConstituencyTopoJson from '../../maps/germany-constituency.topo.json'
import franceRegionTopoJson from '../../maps/france-region.topo.json'
import franceDepartmentTopoJson from '../../maps/france-department.topo.json'
import MapResource from './MapResource'
import fipsHash from '../../data/fips-to-state.json'
import fidHash from '../../data/fid-to-constituency.json'
import wkrHash from '../../data/wkr-to-name.json'
import regionHash from '../../data/region-to-name.json'
import departmentHash from '../../data/department-to-name.json'

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
        label: 'Germany - Constituencies',
        mapResource: new MapResource(germanyConstituencyTopoJson, 'constituencies'),
        geoCodeToName: wkrHash,
      },
      {
        label: 'France - Regions',
        mapResource: new MapResource(franceRegionTopoJson, 'regions'),
        geoCodeToName: regionHash,
      },
      {
        label: 'France - Departments',
        mapResource: new MapResource(franceDepartmentTopoJson, 'departments'),
        geoCodeToName: departmentHash,
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
