import React from 'react'
import ReactDOM from 'react-dom'

import {createElement} from './utils'
import {nTileDomain} from './constants'
import DatasetSelector from './components/DatasetSelector'
import ResolutionSlider from './components/ResolutionSlider'
import HexMetrics from './components/HexMetrics'
import ExportButton from './components/ExportButton'
import ImportButton from './components/ImportButton'

class Ui {
  constructor() {
    this._init()
    this.metricPerTile = null
    this._tiles = null
    this._originalTilesLength = null
    this._usingImportedTiles = false
    this._tileFilename = null

    this._resetImportedTiles = this._resetImportedTiles.bind(this)
  }

  setGeos(geos) {
    this._geos = geos
  }

  setTiles(tiles, originalTilesLength) {
    this._tiles = tiles
    this._originalTilesLength = originalTilesLength
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

  setImportCallback(callback) {
    this._importCallback = (tileFilename, topoJson) => {
      this._tileFilename = tileFilename
      this._usingImportedTiles = true
      callback(topoJson)
    }
  }

  _init() {
    this._container = createElement({id: 'ui'})
  }

  _resetImportedTiles() {
    this._usingImportedTiles = false
    this._tileFilename = null
    this.render()
  }

  render() {
    let tileGenerationControls
    if (this._usingImportedTiles) {
      tileGenerationControls = (
        <fieldset>
          <span>Using {this._tileFilename}</span>
          <a onClick={this._resetImportedTiles}>✕</a>
        </fieldset>
      )
    } else {
      tileGenerationControls = (
        <div>
          <DatasetSelector
            labels={this._datasetLabels}
            onDatasetSelected={index => this._datasetSelectedCallback(index)}
            onCustomDataset={csv => this._customDatasetCallback(csv)}
          />
          <ResolutionSlider
            metricDomain={this._metricDomain}
            onChange={value => this._resolutionChangedCallback(value, this._selectedDatasetSum)}
          />
          <ImportButton onLoad={this._importCallback} />
        </div>
      )
    }
    ReactDOM.render(
      <div>
        <h1>
          Tessellagram Maker
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
        {tileGenerationControls}
        <hr />
        <HexMetrics
          metricPerTile={this.metricPerTile}
          dataset={this._selectedDataset}
          geos={this._geos}
          tiles={this._tiles}
          originalTilesLength={this._originalTilesLength}
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
