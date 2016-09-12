import React from 'react'
import ReactDOM from 'react-dom'

import {createElement} from './utils'
import {nTileDomain} from './constants'
import UiControls from './components/UiControls'
import HexMetrics from './components/HexMetrics'
import ExportButton from './components/ExportButton'
import Modal from './components/Modal'

class Ui {
  constructor() {
    this._init()
    this.metricPerTile = null
    this._tiles = null
    this._originalTilesLength = null
    this._usingImportedTiles = false
    this._tileFilename = null
    this.editing = false

    this._resetImportedTiles = this._resetImportedTiles.bind(this)
    this._startOver = this._startOver.bind(this)
    this._resumeEditing = this._resumeEditing.bind(this)
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

  _setEditing(isEditing) {
    return () => {
      if (!isEditing) {
        if (this._checkForUnsavedChanges()) {
          this._showModal = true
          this.render()
          return
        }
      }
      this.editing = isEditing
      this.render()
    }
  }

  setUnsavedChangesCallback(callback) {
    this._checkForUnsavedChanges = callback
  }

  _init() {
    this._container = createElement({id: 'ui'})
  }

  _resetImportedTiles() {
    this._usingImportedTiles = false
    this._tileFilename = null
    this.render()
  }

  _startOver() {
    this.editing = false
    this._showModal = false
    this.render()
  }

  _resumeEditing() {
    this._showModal = false
    this.render()
  }

  render() {
    const tileGenerationControls = (
      <UiControls
        labels={this._datasetLabels}
        selectDataset={this._datasetSelectedCallback}
        selectCustomDataset={this._customDatasetCallback}
        importCustom={this._importCallback}
        metricDomain={this._metricDomain}
        changeResolution={this._resolutionChangedCallback}
        datasetSum={this._selectedDatasetSum}
        usingImportedtiles={this._usingImportedTiles}
        tileFilename={this._tileFilename}
        resetImportedTiles={this._resetImportedTiles}
      />
    )
    const generateOption = (
      <div
        className={this.editing ? 'step' : 'active step'}
        onClick={this._setEditing(false)}
      >
        <div className='highlight-bar' />
        <p><span>Step 1:</span> Create new topogram.</p>
      </div>
    )
    const editOption = (
      <div
        className={this.editing ? 'active step' : 'step'}
        onClick={this._setEditing(true)}
      >
        <div className='highlight-bar' />
        <p><span>Step 2:</span> Edit topogram and improve accuracy.</p>
      </div>
    )
    let modal = null
    if (this._showModal) {
      modal = (
        <Modal
          startOver={this._startOver}
          resumeEditing={this._resumeEditing}
        />
      )
    }
    ReactDOM.render(
      <div>
        {modal}
        <div className='column'>
          <h1>
            Tilegrams
          </h1>
          <ExportButton onClick={() => this._exportCallback()} />
          <hr />
          {generateOption}
          <div className={this.editing ? 'deselected' : null} >
            {tileGenerationControls}
          </div>
          <hr />
          {editOption}
          <div className={this.editing ? null : 'deselected'}>
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
          </div>
        </div>
        <h2 className='credits'>
          A project by
          <a
            href='http://pitchinteractive.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            Pitch Interactive
          </a>
          |
          View
          <a
            href='https://github.com/PitchInteractiveInc/hexagon-cartograms'
            target='_blank'
            rel='noopener noreferrer'
          >
            source
          </a>
          on GitHub
        </h2>
      </div>,
      this._container
    )
  }
}

export default new Ui()
