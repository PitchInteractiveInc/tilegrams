import {csvParseRows} from 'd3-dsv'
import geographyResource from './GeographyResource.js'
import populationCsv from '../../data/us/population-by-state.csv'
import electoralCollegeCsv from '../../data/us/electoral-college-votes-by-state.csv'
import gdpCsv from '../../data/us/gdp-by-state.csv'
import congressionalDistricts2018 from '../../data/us/congressional-districts-2018.csv'
// import ukConstituency from '../../data/uk/constituencies.csv'
// import ukAuthority from '../../data/uk/authorities.csv'
import germanyConstituency from '../../data/germany/constituencies.csv'
import franceRegionPopulation from '../../data/france/region-population.csv'
import franceDepartment from '../../data/france/departments.csv'
import netherlandsPopulation from '../../data/netherlands/netherlands-populations.csv'
import brazilPopulation2018 from '../../data/brazil/brazil-populations.csv'
import irelandVotes from '../../data/ireland/constituency_values.csv'
import ukRegionConstituencyCounts from '../../data/uk/uk_region_constituency_counts.csv'
import indiaContituencyCounts from '../../data/india/india_constituency_counts.csv';

class DatasetResource {
  constructor() {
    /**
    * Datasets must have an associated geography for the map graphic to successfully compute a
    * cartogram. Default resolution (optional) is the default tile value when a user selects the
    * data from the dropdown.
    */
    this._datasets = [
      {
        label: 'U.S. Population 2016',
        data: this.parseCsv(populationCsv, 'United States'),
        geography: 'United States',
        defaultResolution: 1000000,
      },
      {
        label: 'U.S. Electoral College 2016',
        data: this.parseCsv(electoralCollegeCsv, 'United States'),
        geography: 'United States',
        defaultResolution: 1,
      },
      {
        label: 'U.S. GDP 2015 (Millions)',
        data: this.parseCsv(gdpCsv, 'United States'),
        geography: 'United States',
      },
      {
        label: 'U.S. Congressional Districts 2018',
        data: this.parseCsv(congressionalDistricts2018, 'United States'),
        geography: 'United States',
        defaultResolution: 1,
      },
      {
        label: 'Netherlands – Population',
        data: this.parseCsv(netherlandsPopulation, 'Netherlands'),
        geography: 'Netherlands',
        defaultResolution: 50000,
      },
      {
        label: 'Brazil – Population 2017',
        data: this.parseCsv(brazilPopulation2018, 'Brazil'),
        geography: 'Brazil',
        defaultResolution: 500000,
      },
      // {
      //   label: 'U.K. Constituency 1-to-1',
      //   data: this.parseCsv(ukConstituency, 'United Kingdom - Constituencies'),
      //   geography: 'United Kingdom - Constituencies',
      //   defaultResolution: 1,
      // },
      // {
      //   label: 'U.K. Authority 1-to-1',
      //   data: this.parseCsv(ukAuthority, 'United Kingdom - Local Authorities'),
      //   geography: 'United Kingdom - Local Authorities',
      //   defaultResolution: 1,
      // },
      {
        label: 'Germany Constituency 1-to-1',
        data: this.parseCsv(germanyConstituency, 'Germany - Constituencies'),
        geography: 'Germany - Constituencies',
        defaultResolution: 1,
      },
      {
        label: 'France Region Population',
        data: this.parseCsv(franceRegionPopulation, 'France - Regions'),
        geography: 'France - Regions',
        defaultResolution: 100000,
      },
      {
        label: 'France Department 1-to-1',
        data: this.parseCsv(franceDepartment, 'France - Departments'),
        geography: 'France - Departments',
        defaultResolution: 1,
      },
      {
        label: 'Ireland Constituencies',
        data: this.parseCsv(irelandVotes, 'Ireland'),
        geography: 'Ireland',
        defaultResolution: 1,
      },
      {
        label: 'United Kingdom - Regions',
        data: this.parseCsv(ukRegionConstituencyCounts, 'United Kingdom - Regions'),
        geography: 'United Kingdom - Regions',
        defaultResolution: 1,
      },
      {
        label: 'India Constituencies',
        data: this.parseCsv(indiaContituencyCounts, 'India'),
        geography: 'India',
        defaultResolution: 1,
      },
    ]

    this._selectedDatasetIndex = 2
  }

  _validateFips(fips) {
    return fips && fips.length < 2 ? `0${fips}` : fips
  }

  parseCsv(csv, geography, customUpload) {
    const mapResource = geographyResource.getMapResource(geography)
    const features = mapResource.getUniqueFeatureIds()
    const badMapIds = []
    const badValueIds = []
    csv = csv.trim()
    let parsed
    if (geography === 'United States') {
      parsed = csvParseRows(csv, d => [this._validateFips(d[0]), parseFloat(d[1])])
    } else {
      parsed = csvParseRows(csv, d => [d[0], parseFloat(d[1])])
    }
    if (customUpload) {
      // extra data validation for custom uploads
      parsed = parsed.filter(row => {
        const hasId = (features.indexOf(row[0]) > -1)
        if (!hasId) {
          badMapIds.push(row[0])
        }
        if (row[1] <= 0 || isNaN(row[1])) {
          badValueIds.push(row[0])
        }
        return hasId && row[1] > 0
      })
      if (badMapIds.length || badValueIds.length) {
        this._warnDataErrors(badMapIds, badValueIds)
      }
    }
    return parsed
  }

  _warnDataErrors(badMapIds, badValueIds) {
    const mapIdString = badMapIds.map(id => `"${id}"`).join(', ')
    const valueIdString = badValueIds.map(id => `"${id}"`).join(', ')
    let alertString = ''
    if (mapIdString) {
      alertString += `There is no associated map data associated with id(s): ${mapIdString}.`
    }
    if (valueIdString) {
      alertString += ` Ids ${valueIdString} have zero or negative value.`
    }
    alertString += ' This data has been pruned.'
    // eslint-disable-next-line no-alert
    alert(alertString)
  }

  getLabels() {
    return this._datasets.map(dataset => dataset.label)
  }

  getDataset(geography, index) {
    return this.getDatasetsByGeography(geography)[index]
  }

  getDatasetGeography(index) {
    return this._datasets[index].geography
  }

  getDatasetsByGeography(geography) {
    return this._datasets.filter(dataset => dataset.geography === geography)
  }

  buildDatasetFromCustomCsv(geography, csv) {
    return {
      data: this.parseCsv(csv, geography, true),
      geography,
    }
  }
}

export default new DatasetResource()
