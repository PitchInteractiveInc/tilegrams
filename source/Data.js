import {csvParseRows} from 'd3-dsv'

import populationCsv from '../data/population-by-county-CA.csv'

class Data {
  constructor() {
    this._datasets = [
      {
        label: 'Population',
        data: this.parseCsv(populationCsv),
      },
    ]
    this._selectedDatasetIndex = 2
  }

  parseCsv(csv) {
    return csvParseRows(csv, d => [d[0], +d[1]])
  }

  getLabels() {
    return this._datasets.map(dataset => dataset.label)
  }

  getDataset(index) {
    return this._datasets[index].data
  }
}

export default new Data()
