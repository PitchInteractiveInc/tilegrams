import React from 'react'
import ReactDOM from 'react-dom'

import {createElement} from './utils'
import DatasetSelector from './components/DatasetSelector'
import ResolutionSlider from './components/ResolutionSlider'
import HexMetrics from './components/HexMetrics'
import ExportButton from './components/ExportButton'

class Ui {
  constructor() {
    this._init()
  }

  setGeos(geos) {
    this._geos = geos
  }

  setAddTileCallback(callback) {
    this._addTileCallback = callback
  }

  setDatasetLabels(datasetLabels) {
    this._datasetLabels = datasetLabels
  }

  setSelectedDataset(dataset) {
    this._selectedDataset = dataset
  }

  setDatasetSelectedCallback(callback) {
    this._datasetSelectedCallback = callback
  }

  setCustomDatasetCallback(callback) {
    this._customDatasetCallback = callback
  }

  setHightlightCallback(callback) {
    this._highlightCallback = callback
  }

  setUnhighlightCallback(callback) {
    this._unhighlightCallback = callback
  }

  setResolutionChangedCallback(callback) {
    this._resolutionChangedCallback = callback
  }

  setExportCallback(callback) {
    this._exportCallback = callback
  }

  _init() {
    this._container = createElement({id: 'ui'})
  }

  render(tiles, originalTilesLength) {
    ReactDOM.render(
      <div>
        <h1>
          Tesselated Hexagon Cartogram Authoring Interface
        </h1>
        <h2>
          A project by
          <a
            href="http://pitchinteractive.com/"
            target="_blank">
            Pitch Interactive
          </a>
          <br/>
          <br/>
          View
          <a
            href="https://github.com/PitchInteractiveInc/hexagon-cartograms"
            target="_blank">
            source
          </a>
          on GitHub
          <br/>
          <br/>
          Instructions forthcoming
        </h2>
        <ExportButton onClick={() => this._exportCallback()} />
        <hr/>
        <DatasetSelector
          labels={this._datasetLabels}
          onDatasetSelected={index => this._datasetSelectedCallback(index)}
          onCustomDataset={csv => this._customDatasetCallback(csv)}
          />
        <ResolutionSlider
          onChange={value => this._resolutionChangedCallback(value)}
          />
        <hr />
        <HexMetrics
          dataset={this._selectedDataset}
          geos={this._geos}
          tiles={tiles}
          originalTilesLength={originalTilesLength}
          onAddTileMouseDown={this._addTileCallback}
          onMetricMouseOver={this._highlightCallback}
          onMetricMouseOut={this._unhighlightCallback}
          />
      </div>,
      this._container
    )
  }
}

export default new Ui()
