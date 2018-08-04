import {geoAlbersUsa, geoMercator} from 'd3-geo'

import usTopoJson from '../../maps/us/us-110m.topo.json'
// import ukConstituencyTopoJson from '../../maps/uk/constituency.topo.json'
// import ukAuthorityTopoJson from '../../maps/uk/local-authority.topo.json'
import germanyConstituencyTopoJson from '../../maps/germany/constituency.topo.json'
import franceRegionTopoJson from '../../maps/france/region.topo.json'
import franceDepartmentTopoJson from '../../maps/france/department.topo.json'
import netherlandsTopoJson from '../../maps/netherlands/netherlands.topo.json'
import brazilTopoJson from '../../maps/brazil/brazil.topo.json'
import irelandTopoJson from '../../maps/ireland/Irish_Constituencies.topo.json'
//
import pakistanTopoJson from '../../maps/pakistan/pakistan.json'
import pakistanNewTopoJson from '../../maps/pakistanNew/pakistan.json'

import testingTopoJson from '../../maps/testing/testing.json'
//
import MapResource from './MapResource'
import fipsHash from '../../data/us/fips-to-state.json'
// import fidHash from '../../data/uk/fid-to-constituency.json'
// import authorityIdHash from '../../data/uk/id-to-authority.json'
import wkrHash from '../../data/germany/wkr-to-name.json'
import regionHash from '../../data/france/region-to-name.json'
import departmentHash from '../../data/france/department-to-name.json'
import netherlandsHash from '../../data/netherlands/netherlands-names.json'

//
import pakistanHash from '../../data/pakistan/names.json'
import pakistanNewHash from '../../data/pakistan/newNames.json'
import testingHash from '../../data/testing/names.json'

import brazilHash from '../../data/brazil/brazil-names.json'
import irelandHash from '../../data/ireland/constituency_names.json'
//

const usProjection = (canvasDimensions) => {
  return geoAlbersUsa()
    .scale(canvasDimensions.width)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}

// const ukProjection = (canvasDimensions) => {
//   return geoMercator()
//     .center([-2, 55.7])
//     .scale(canvasDimensions.height * 2.9)
//     .translate([
//       canvasDimensions.width * 0.5,
//       canvasDimensions.height * 0.5,
//     ])
// }

const germanyProjection = (canvasDimensions) => {
  return geoMercator()
    .center([11, 51.2])
    .scale(canvasDimensions.height * 3.9)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}

const franceProjection = (canvasDimensions) => {
  return geoMercator()
    .center([3.4, 46.3])
    .scale(canvasDimensions.height * 3.4)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}

const netherlandsProjection = (canvasDimensions) => {
  return geoMercator()
    .center([5.668945, 52.112198])
    .scale(canvasDimensions.height * 11)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}

//
const pakistanProjection = (canvasDimensions) => {
  return geoMercator()
    .center([71, 30.2])
    .scale(canvasDimensions.height * 2)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}

const pakistanNewProjection = (canvasDimensions) => {
  return geoMercator()
    .center([71, 30.2])
    .scale(canvasDimensions.height * 3)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}

const testingProjection = (canvasDimensions) => {
  return geoMercator()
    .center([71, 30.2])
    .scale(canvasDimensions.height * 3)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}
//

const brazilProjection = (canvasDimensions) => {
  return geoMercator()
    .center([-50, -15])
    .scale(canvasDimensions.height)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}

const irelandProjection = (canvasDimensions) => {
  return geoMercator()
    .center([-7, 53.0])
    .scale(canvasDimensions.height * 5.9)
    .translate([
      canvasDimensions.width * 0.5,
      canvasDimensions.height * 0.5,
    ])
}

class GeographyResource {
  constructor() {
    this._geographies = [
      {
        label: 'United States',
        mapResource: new MapResource(usTopoJson, 'states'),
        geoCodeToName: fipsHash,
        projection: usProjection,
      },
      //
      {
        label: 'Pakistan',
        mapResource: new MapResource(pakistanTopoJson, 'boundaries'),
        geoCodeToName: pakistanHash,
        projection: pakistanProjection,
      },
      {
        label: 'Pakistan New',
        mapResource: new MapResource(pakistanNewTopoJson, 'boundaries'),
        geoCodeToName: pakistanNewHash,
        projection: pakistanNewProjection,
      },
      {
        label: 'testing',
        mapResource: new MapResource(testingTopoJson, 'boundaries'),
        geoCodeToName: testingHash,
        projection: testingProjection,
      },
      //
      // {
      //   label: 'United Kingdom - Constituencies',
      //   mapResource: new MapResource(ukConstituencyTopoJson, 'constituencies'),
      //   geoCodeToName: fidHash,
      //   projection: ukProjection,
      // },
      // {
      //   label: 'United Kingdom - Local Authorities',
      //   mapResource: new MapResource(ukAuthorityTopoJson, 'authorities'),
      //   geoCodeToName: authorityIdHash,
      //   projection: ukProjection,
      {
        label: 'Germany - Constituencies',
        mapResource: new MapResource(germanyConstituencyTopoJson, 'constituencies'),
        geoCodeToName: wkrHash,
        projection: germanyProjection,
      },
      {
        label: 'France - Regions',
        mapResource: new MapResource(franceRegionTopoJson, 'regions'),
        geoCodeToName: regionHash,
        projection: franceProjection,
      },
      {
        label: 'France - Departments',
        mapResource: new MapResource(franceDepartmentTopoJson, 'departments'),
        geoCodeToName: departmentHash,
        projection: franceProjection,
      },
      {
        label: 'Netherlands',
        mapResource: new MapResource(netherlandsTopoJson, 'dutch municipalities'),
        geoCodeToName: netherlandsHash,
        projection: netherlandsProjection,
      },
      {
        label: 'Brazil',
        mapResource: new MapResource(brazilTopoJson, 'estados'),
        geoCodeToName: brazilHash,
        projection: brazilProjection,
      },
      {
        label: 'Ireland',
        mapResource: new MapResource(irelandTopoJson, 'Irish_Constituencies'),
        geoCodeToName: irelandHash,
        projection: irelandProjection,
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

  getProjection(label, canvasDimensions) {
    const nullProjection = d => d
    if (!label) { return nullProjection }
    const projectionFn = this._geographies.find(geography => geography.label === label).projection
    return projectionFn(canvasDimensions)
  }
}

export default new GeographyResource()
