import React from 'react'

import DatasetSelector from './DatasetSelector'
import ResolutionSlider from './ResolutionSlider'
import ImportControls from './ImportControls'

export default class TileGenerationUiControls extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedOption: 'import',
    }

    this._changeOption = this._changeOption.bind(this)
    this._onCustomImport = this._onCustomImport.bind(this)
    this._onTilegramSelected = this._onTilegramSelected.bind(this)

    this._restoreLastTilegramSelection = null
  }

  _changeOption(event) {
    const selectedOption = event.target.value
    const newState = {selectedOption}
    if (selectedOption === 'import') {
      if (this._restoreLastTilegramSelection) {
        this._restoreLastTilegramSelection()
      } else {
        this.props.selectTilegram(0)
      }
    } else if (selectedOption === 'generate') {
      this.props.selectDataset(0)
    }
    this.setState(newState)
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
        <div className={`padding-bottom`}>
          <input
            type='radio'
            name='tile-controls'
            value='import'
            checked={this.state.selectedOption === 'import'}
            onChange={this._changeOption}
          /> Load tilegram
          <div className={this.state.selectedOption !== 'import' ? 'collapsed' : null} >
            <ImportControls
              labels={this.props.tilegramLabels}
              onCustomImport={this._onCustomImport}
              onTilegramSelected={this._onTilegramSelected}
            />
          </div>
        </div>
        <div>
          <input
            type='radio'
            name='tile-controls'
            value='generate'
            checked={this.state.selectedOption === 'generate'}
            onChange={this._changeOption}
          /> Generate Cartogram From Data
          <div className={this.state.selectedOption !== 'generate' ? 'collapsed' : null}>
            <DatasetSelector
              labels={this.props.datasetLabels}
              onDatasetSelected={index => this.props.selectDataset(index)}
              onCustomDataset={csv => this.props.selectCustomDataset(csv)}
            />
            <ResolutionSlider
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
  selectCustomDataset: React.PropTypes.func,
  importCustom: React.PropTypes.func,
  changeResolution: React.PropTypes.func,
  datasetSum: React.PropTypes.number,
  metricDomain: React.PropTypes.array,
  editing: React.PropTypes.bool,
}

TileGenerationUiControls.defaultProps = {
  datasetLabels: [],
  tilegramLabels: [],
  selectDataset: () => {},
  selectTilegram: () => {},
  selectCustomDataset: () => {},
  importCustom: () => {},
  changeResolution: () => {},
  editing: false,
}
