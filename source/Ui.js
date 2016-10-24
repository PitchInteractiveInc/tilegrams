import React from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'

import manual from 'raw!../MANUAL.md'

import metrics from './Metrics'
import {createElement} from './utils'
import {nTileDomain} from './constants'
import TileGenerationUiControls from './components/TileGenerationUiControls'
import HexMetrics from './components/HexMetrics'
import ExportButton from './components/ExportButton'
import EditWarningModal from './components/EditWarningModal'
import googleNewsLabLogo from './images/gnl-logo.png'
import tilegramsLogo from './images/tilegrams-logo.svg'
import twitterLogo from './images/social-twitter.svg'
import facebookLogo from './images/social-facebook.svg'

class Ui {
  constructor() {
    this._init()
    this._tiles = null
    this._editing = false
    this._generateOpen = true
    this._editOpen = false
    this._manualOpen = false
    this._nErrors = 0

    this._startOver = this._startOver.bind(this)
    this._resumeEditing = this._resumeEditing.bind(this)
    this._checkForEdits = this._checkForEdits.bind(this)
    this._toggleManual = this._toggleManual.bind(this)
    this._updateNErrors = this._updateNErrors.bind(this)
  }

  setGeos(geos) {
    this._geos = geos
  }

  setTiles(tiles) {
    this._tiles = tiles
  }

  setAddTileCallback(callback) {
    this._addTileCallback = callback
  }

  setDatasetLabels(datasetLabels) {
    this._datasetLabels = datasetLabels
  }

  setTilegramLabels(tilegramLabels) {
    this._tilegramLabels = tilegramLabels
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
    this._datasetSelectedCallback = (index) => {
      callback(index)
    }
  }

  setTilegramSelectedCallback(callback) {
    this._tilegramSelectedCallback = (index) => {
      callback(index)
    }
  }

  setCustomDatasetCallback(callback) {
    this._customDatasetCallback = (csv) => {
      callback(csv)
    }
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
    this._importCallback = (topoJson) => {
      callback(topoJson)
    }
  }

  _checkForEdits(event) {
    if (this._checkForUnsavedChanges()) {
      event.preventDefault()
      event.stopPropagation()
      this._showModal = true
      this.render()
      return
    }
    this._editing = false
    this.render()
    // to allow CSS to paint
    window.requestAnimationFrame(this.render.bind(this))
  }

  setUnsavedChangesCallback(callback) {
    this._checkForUnsavedChanges = callback
  }

  setResetUnsavedChangesCallback(callback) {
    this._resetUnsavedChanges = callback
  }

  _init() {
    this._container = createElement({id: 'ui'})
  }

  _startOver() {
    this._editing = false
    this._showModal = false
    this._resetUnsavedChanges()
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

  _toggle(toggleOpt) {
    return () => {
      if (toggleOpt === 'generate') {
        this._generateOpen = !this._generateOpen
      } else if (toggleOpt === 'edit') {
        this._editOpen = !this._editOpen
      }
      this.render()
    }
  }

  _toggleManual() {
    this._manualOpen = !this._manualOpen
    this.render()
  }

  _updateNErrors(value) {
    if (this._nErrors !== value) {
      this._nErrors = value
      this.render()
    }
  }

  render() {
    const tileGenerationControls = (
      <TileGenerationUiControls
        datasetLabels={this._datasetLabels}
        tilegramLabels={this._tilegramLabels}
        selectDataset={this._datasetSelectedCallback}
        selectTilegram={this._tilegramSelectedCallback}
        selectCustomDataset={this._customDatasetCallback}
        importCustom={this._importCallback}
        metricDomain={this._metricDomain}
        metricPerTile={metrics.metricPerTile}
        changeResolution={this._resolutionChangedCallback}
        datasetSum={this._selectedDatasetSum}
        editing={this._editing}
      />
    )
    const generateOption = (
      <div
        className={this._generateOpen ? 'step' : 'active step'}
        onClick={this._toggle('generate')}
      >
        <span>Generate</span>
        <span className='arrow' />
      </div>
    )
    const editOption = (
      <div
        className={this._editOpen ? 'step' : 'active step'}
        onClick={this._toggle('edit')}
      >
        <span>Refine </span><span className='n-errors'>({this._nErrors} states w/ errors)</span>
        <span className='arrow' />
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
    const uiControlsHeight = this._generateOpen ? 'auto' : '0px'
    const metricsHeight = this._editOpen ? 'auto' : '0px'
    const manualClass = this._manualOpen ? 'manual' : 'manual hidden'
    ReactDOM.render(
      <div>
        {modal}
        <div className={manualClass}>
          <div
            className='manual-close'
            onClick={this._toggleManual}
          >
            &#10005;
          </div>
          <ReactMarkdown source={manual} />
        </div>
        <div className='mobile-redirect'>
          <div className='background'>
            <div className='main'>
              <h1>TILEGRAMS</h1>
              <img src={tilegramsLogo} className='tilegrams-logo' alt='Tilegrams' />
              <h2>Create tiled maps where regions are sized proportionally to a dataset.</h2>
              <h3>For optimal experience visit us on a laptop or desktop computer.</h3>
            </div>
          </div>
        </div>
        <div className='header'>
          <h1 className='title'>
            TILEGRAMS
            <img src={tilegramsLogo} className='tilegrams-logo' alt='Tilegrams' />
            <span className='by-pitch'>by Pitch Interactive</span>
          </h1>
          <div className='share'>
            <a href='https://twitter.com/intent/tweet?text=Tilegrams+from+Pitch+Interactive+https%3A%2F%2Fpitchinteractiveinc.github.io%2Ftilegrams%2F'>
              <img src={twitterLogo} alt='Twitter' />
            </a>
            <a href='https://www.facebook.com/sharer.php?u=https%3A%2F%2Fpitchinteractiveinc.github.io%2Ftilegrams%2F'>
              <img src={facebookLogo} alt='Facebook' />
            </a>
          </div>
        </div>
        <div className='column'>
          <div>
            <p className='intro'>
              Create tiled maps where regions are sized proportionally to a dataset.
              <br />
              <br />
              For detailed information and instructions, check out the
              <a
                onClick={this._toggleManual}
                target='_blank'
                rel='noopener noreferrer'
              > manual</a>.
            </p>
            <hr />
            {generateOption}
            <div
              className={this._editing ? 'deselected' : ''}
              style={{height: uiControlsHeight, overflow: 'hidden'}}
              onMouseDown={this._checkForEdits}
            >
              {tileGenerationControls}
            </div>
            <hr />
            {editOption}
          </div>
          <div
            className={this._editing ? '' : 'deselected'}
            style={{height: metricsHeight, overflow: 'hidden'}}
          >
            <HexMetrics
              metricPerTile={metrics.metricPerTile}
              dataset={this._selectedDataset}
              geos={this._geos}
              tiles={this._tiles}
              onAddTileMouseDown={this._addTileCallback}
              onMetricMouseOver={this._highlightCallback}
              onMetricMouseOut={this._unhighlightCallback}
              updateNErrors={this._updateNErrors}
            />
          </div>
          <hr />
          <div className='download'>
            <div className='step'>
              <span>Download</span>
            </div>
            <div className='instruction'>
              {`To embed your tilegram or manipulate it further,
                export it in one of these standard formats.`}
            </div>
            <fieldset>
              <ExportButton
                text='TopoJSON'
                onClick={() => this._exportCallback()}
              />
              <ExportButton
                text='SVG'
                onClick={() => this._exportSvgCallback()}
              />
            </fieldset>
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
          in association with
          <a
            href='https://newslab.withgoogle.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img src={googleNewsLabLogo} className='gnl-logo' alt='Google News Lab' />
          </a>
          <span className='source'>|
            View
            <a
              href='https://github.com/PitchInteractiveInc/tilegrams'
              target='_blank'
              rel='noopener noreferrer'
            >
              source
            </a>
            on GitHub
          </span>
        </h2>
      </div>,
      this._container
    )
  }
}

export default new Ui()
