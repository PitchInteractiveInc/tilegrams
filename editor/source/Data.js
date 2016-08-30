import {csvParseRows} from 'd3-dsv'

import populationCsv from '../data/population-by-state.csv'
import electoralCollegeCsv from '../data/electoral-college-votes-by-state.csv'
import gdpCsv from '../data/gdp-by-state.csv'

class Data {
  constructor() {
    this._datasets = [
      {
        label: "Population 2016",
        data: csvParseRows(populationCsv),
      },
      {
        label: "Electoral College 2016",
        data: csvParseRows(electoralCollegeCsv),
      },
      {
        label: "GDP 2016",
        data: csvParseRows(gdpCsv),
      },
    ]
    this._selectedDatasetIndex = 2
  }

  getLabels() {
    return this._datasets.map(dataset => dataset.label)
  }

  getDataset(index) {
    return this._datasets[index].data
  }
}

export default new Data()
