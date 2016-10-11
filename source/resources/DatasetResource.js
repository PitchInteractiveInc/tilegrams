import {csvParseRows} from 'd3-dsv'

import mapResource from './MapResource'

import populationCsv from '../../data/population-by-state.csv'
import electoralCollegeCsv from '../../data/electoral-college-votes-by-state.csv'
import gdpCsv from '../../data/gdp-by-state.csv'

class DatasetResource {
  constructor() {
    this._datasets = [
      {
        label: 'U.S. Population 2016',
        data: this.parseCsv(populationCsv),
      },
      {
        label: 'U.S. Electoral College 2016',
        data: this.parseCsv(electoralCollegeCsv),
      },
      {
        label: 'U.S. GDP 2015 (Millions)',
        data: this.parseCsv(gdpCsv),
      },
    ]
    this._selectedDatasetIndex = 2
  }

  parseCsv(csv) {
    const features = mapResource.getUniqueFeatureIds()
    const missingIds = []
    const parsed = csvParseRows(csv, d => [d[0], +d[1]]).filter(row => {
      const hasId = features.indexOf(row[0]) > -1
      if (!hasId) {
        missingIds.push(row[0])
      }
      return hasId
    })
    if (missingIds.length) {
      this._warnMissing(missingIds)
    }
    return parsed
  }

  _warnMissing(missingIds) {
    const idString = missingIds.join(',')
    let alertString = `There is no associated map data associated with id(s): ${idString}.`
    alertString += ' This data has been pruned.'
    alert(alertString)
  }

  getLabels() {
    return this._datasets.map(dataset => dataset.label)
  }

  getDataset(index) {
    return this._datasets[index].data
  }

  buildDatasetFromTiles(tiles) {
    const datasetMap = {}
    tiles.forEach((tile) => {
      datasetMap[tile.id] = [tile.id, tile.tilegramValue]
    })
    return Object.keys(datasetMap).map((row) => datasetMap[row])
  }
}

export default new DatasetResource()
