import React from 'react'
import ReactDOM from 'react-dom'

import {createElement} from './utils'
import {nTileDomain} from './constants'
import DatasetSelector from './components/DatasetSelector'
import ResolutionSlider from './components/ResolutionSlider'
import HexMetrics from './components/HexMetrics'
import ExportButton from './components/ExportButton'
import ToolSelector from './components/ToolSelector'

class Ui {
  constructor() {
    this._init()
    this.metricPerTile = null
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
    this._selectedDatasetSum = this.getDatasetSum(dataset)
    this._metricDomain = this._calculateIdealDomain()
  }

  /** calculate the slider's domain from the dataset */
  _calculateIdealDomain() {
    const metricMin = this.roundToPretty(this._selectedDatasetSum / nTileDomain[0])
    const metricMax = this.roundToPretty(this._selectedDatasetSum / nTileDomain[1])
    return [metricMax, metricMin]
  }

  /** round to two significant digits rounded to nearest multiple of 5 */
  roundToPretty(number) {
    const units = Math.pow(10, Math.floor(Math.log10(number)) - 1)
    const significant = number / units
    const rounded = 5 * (Math.round(significant / 5))
    return rounded * units
  }

  getDatasetSum(dataset) {
    return dataset.reduce((a, b) => { return a + b[1] }, 0)
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

  setToolChangedCallback(callback) {
    this._toolChangedCallback = callback
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
            href='http://pitchinteractive.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            Pitch Interactive
          </a>
          <br />
          <br />
          View
          <a
            href='https://github.com/PitchInteractiveInc/hexagon-cartograms'
            target='_blank'
            rel='noopener noreferrer'
          >
            source
          </a>
          on GitHub
          <br />
          <br />
          Instructions forthcoming
        </h2>
        <ExportButton onClick={() => this._exportCallback()} />
        <hr />
        <DatasetSelector
          labels={this._datasetLabels}
          onDatasetSelected={index => this._datasetSelectedCallback(index)}
          onCustomDataset={csv => this._customDatasetCallback(csv)}
        />
        <ResolutionSlider
          metricDomain={this._metricDomain}
          onChange={value => this._resolutionChangedCallback(value, this._selectedDatasetSum)}
        />
        <hr />
        <ToolSelector onSelect={tool => this._toolChangedCallback(tool)} />
        <HexMetrics
          metricPerTile={this.metricPerTile}
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
