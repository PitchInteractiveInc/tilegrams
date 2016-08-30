import React from 'react'
import ReactDOM from 'react-dom'

import {createElement} from './utils'
import DatasetSelector from './components/DatasetSelector'
import HexMetrics from './components/HexMetrics'

class Ui {
  constructor() {
    this._init()
  }

  setGeos(geos) {
    this._geos = geos
  }

  setDatasetLabels(datasetLabels) {
    this._datasetLabels = datasetLabels
  }

  setAddTileCallback(callback) {
    this._addTileCallback = callback
  }

  setDatasetSelectedCallback(callback) {
    this._datasetSelectedCallback = callback
  }

  _init() {
    this._container = createElement({id: 'ui'})
  }

  render(tiles, originalTilesLength) {
    ReactDOM.render(
      <div>
        <DatasetSelector
          labels={this._datasetLabels}
          onDatasetSelected={(index) => this._datasetSelectedCallback(index)}
          />
        <hr />
        <HexMetrics
          geos={this._geos}
          tiles={tiles}
          originalTilesLength={originalTilesLength}
          onAddTileMouseDown={this._addTileCallback}
          />
      </div>,
      this._container
    )
  }
}

export default new Ui()
