import React from 'react'
import ReactDOM from 'react-dom'

import {createElement} from './utils'
import {nTileDomain} from './constants'
import TileGenerationUiControls from './components/TileGenerationUiControls'
import HexMetrics from './components/HexMetrics'
import ExportButton from './components/ExportButton'
import EditWarningModal from './components/EditWarningModal'

class Ui {
  constructor() {
    this._init()
    this.metricPerTile = null
    this._tiles = null
    this._originalTilesLength = null
    this._usingImportedTiles = false
    this._tileFilename = null
    this._editing = false

    this._resetImportedTiles = this._resetImportedTiles.bind(this)
    this._startOver = this._startOver.bind(this)
    this._resumeEditing = this._resumeEditing.bind(this)
    window.addEventListener('resize', this._resize)
  }

  _resize() {
    const heightAvailable = Array.prototype.slice.call(
      document.querySelectorAll('.no-scroll-ui')
    ).reduce(
      (remainingHeight, node) => {
        const dimensions = node.getBoundingClientRect()
        return remainingHeight - dimensions.height
      },
      window.innerHeight - 15
    )
    document.querySelector('.metrics').style.height = `${heightAvailable}px`
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

  setExportSvgCallback(callback) {
    this._exportSvgCallback = callback
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
      this._editing = isEditing
      this.render()

      // to allow CSS to paint
      window.requestAnimationFrame(this.render.bind(this))
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
    this._editing = false
    this._showModal = false
    this.render()
  }

  _resumeEditing() {
    this._showModal = false
    this.render()
  }

  setEditingTrue() {
    this._editing = true
    this.render()
  }

  render() {
    const tileGenerationControls = (
      <TileGenerationUiControls
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
        editing={this._editing}
      />
    )
    const generateOption = (
      <div
        className={this._editing ? 'step' : 'active step'}
        onClick={this._setEditing(false)}
      >
        <div className='highlight-bar' />
        <p><span>Step 1:</span> Create new topogram.</p>
      </div>
    )
    const editOption = (
      <div
        className={this._editing ? 'active step' : 'step'}
        onClick={this._setEditing(true)}
      >
        <div className='highlight-bar' />
        <p><span>Step 2:</span> Edit topogram and improve accuracy.</p>
      </div>
    )
    let modal = null
    if (this._showModal) {
      modal = (
        <EditWarningModal
          startOver={this._startOver}
          resumeEditing={this._resumeEditing}
        />
      )
    }
    ReactDOM.render(
      <div>
        {modal}
        <div className='column'>
          <div className='no-scroll-ui'>
            <h1 className='title'>
              Tilegrams
            </h1>
            <hr />
            {generateOption}
            <div className={this._editing ? 'deselected' : null} >
              {tileGenerationControls}
            </div>
            <hr />
            {editOption}
          </div>
          <div className={this._editing ? null : 'deselected'}>
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
          <div className='no-scroll-ui'>
            <ExportButton
              text='Export Svg'
              onClick={() => this._exportSvgCallback()}
            />
            <ExportButton
              text='Export TopoJSON'
              onClick={() => this._exportCallback()}
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
    this._resize()
  }
}

export default new Ui()
