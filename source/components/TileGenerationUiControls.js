import React from 'react'

import DatasetSelector from './DatasetSelector'
import ResolutionSlider from './ResolutionSlider'
import ImportControls from './ImportControls'

export default class TileGenerationUiControls extends React.Component {
  constructor(props) {
    super(props)

    this._changeOption = this._changeOption.bind(this)
    this._onCustomImport = this._onCustomImport.bind(this)
    this._onTilegramSelected = this._onTilegramSelected.bind(this)

    this._restoreLastTilegramSelection = null
  }

  _changeOption(event) {
    const value = event.target.value
    this.props.changeOption(value)
    if (value === 'import') {
      if (this._restoreLastTilegramSelection) {
        this._restoreLastTilegramSelection()
      } else {
        this.props.selectTilegram(0)
      }
    } else if (value === 'generate') {
      this.props.selectDataset(0)
    }
  }

  _onCustomImport(topoJson) {
    this._storeLastTilegramSelection(() => this.props.importCustom(topoJson))
  }

  _onTilegramSelected(index) {
    this._storeLastTilegramSelection(() => this.props.selectTilegram(index))
  }

  _storeLastTilegramSelection(restoreLastTilegramSelection) {
    this._restoreLastTilegramSelection = restoreLastTilegramSelection
    this._restoreLastTilegramSelection()
  }

  render() {
    return (
      <div className='ui-controls'>
        <div
          className={this.props.generateOption === 'import'
            ? 'import active padding-bottom'
            : 'import padding-bottom'}
        >
          <input
            id='load-tilegram'
            type='radio'
            name='tile-controls'
            value='import'
            checked={this.props.generateOption === 'import'}
            onChange={this._changeOption}
          />
          <label htmlFor='load-tilegram' className='radio-label'>
            Load existing tilegram
          </label>
          <div className={this.props.generateOption !== 'import' ? 'collapsed' : ''} >
            <ImportControls
              labels={this.props.tilegramLabels}
              onCustomImport={this._onCustomImport}
              onTilegramSelected={this._onTilegramSelected}
              metricPerTile={this.props.metricPerTile}
            />
          </div>
        </div>
        <div
          className={this.props.generateOption === 'generate'
            ? 'import active padding-bottom'
            : 'import padding-bottom'}
        >
          <input
            id='generate-tilegram'
            type='radio'
            name='tile-controls'
            value='generate'
            checked={this.props.generateOption === 'generate'}
            onChange={this._changeOption}
          />
          <label htmlFor='generate-tilegram' className='radio-label'>
            Generate from data
          </label>
          <div className={this.props.generateOption !== 'generate' ? 'collapsed' : null}>
            <DatasetSelector
              labels={this.props.datasetLabels}
              onDatasetSelected={index => this.props.selectDataset(index)}
              onCustomDataset={csv => this.props.selectCustomDataset(csv)}
              geography={this.props.geography}
            />
            <ResolutionSlider
              defaultResolution={this.props.defaultResolution}
              metricDomain={this.props.metricDomain}
              onChange={value => this.props.changeResolution(value, this.props.datasetSum)}
            />
          </div>
        </div>
      </div>
    )
  }
}

TileGenerationUiControls.propTypes = {
  datasetLabels: React.PropTypes.array,
  tilegramLabels: React.PropTypes.array,
  selectDataset: React.PropTypes.func,
  selectTilegram: React.PropTypes.func,
  changeOption: React.PropTypes.func,
  generateOption: React.PropTypes.string,
  selectCustomDataset: React.PropTypes.func,
  importCustom: React.PropTypes.func,
  changeResolution: React.PropTypes.func,
  datasetSum: React.PropTypes.number,
  metricDomain: React.PropTypes.array,
  defaultResolution: React.PropTypes.number,
  metricPerTile: React.PropTypes.number,
  editing: React.PropTypes.bool,
  generateOpen: React.PropTypes.bool,
  editOpen: React.PropTypes.bool,
  geography: React.PropTypes.string,
}

TileGenerationUiControls.defaultProps = {
  datasetLabels: [],
  tilegramLabels: [],
  selectDataset: () => {},
  selectTilegram: () => {},
  changeOption: () => {},
  selectCustomDataset: () => {},
  importCustom: () => {},
  changeResolution: () => {},
  metricPerTile: 1,
  editing: false,
  generateOption: 'import',
}
