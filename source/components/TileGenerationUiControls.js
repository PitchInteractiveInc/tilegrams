import React from 'react'

import DatasetSelector from './DatasetSelector'
import ResolutionSlider from './ResolutionSlider'
import ImportButton from './ImportButton'

export default class TileGenerationUiControls extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedOption: 'generate',
    }

    this._changeOption = this._changeOption.bind(this)
  }

  _changeOption(event) {
    if (this.props.tileFilename || this.state.selectedOption === 'import') {
      this.props.resetImportedTiles()
    }
    this.setState({
      selectedOption: event.target.value,
    })
  }

  render() {
    let importControls = <ImportButton onLoad={this.props.importCustom} />
    if (this.props.usingImportedtiles) {
      importControls = (
        <fieldset>
          <span>Using {this.props.tileFilename}</span>
          <a onClick={this.props.resetImportedTiles}>✕</a>
        </fieldset>
      )
    }

    const generateCollapsedClass = this.state.selectedOption !== 'generate' && this.props.editing ?
      'collapsed' :
      ''
    const importCollapsedClass = this.state.selectedOption !== 'import' && this.props.editing ?
      'collapsed' :
      ''

    return (
      <div className='ui-controls'>
        <div className={`padding-bottom ${generateCollapsedClass}`}>
          <input
            type='radio'
            name='tile-controls'
            value='generate'
            checked={this.state.selectedOption === 'generate'}
            onChange={this._changeOption}
          /> Generate Cartogram From Data
          <div className={this.state.selectedOption !== 'generate' ? 'deselected' : null}>
            <DatasetSelector
              labels={this.props.labels}
              onDatasetSelected={index => this.props.selectDataset(index)}
              onCustomDataset={csv => this.props.selectCustomDataset(csv)}
            />
            <ResolutionSlider
              metricDomain={this.props.metricDomain}
              onChange={value => this.props.changeResolution(value, this.props.datasetSum)}
            />
          </div>
        </div>
        <div className={importCollapsedClass}>
          <input
            type='radio'
            name='tile-controls'
            value='import'
            checked={this.state.selectedOption === 'import'}
            onChange={this._changeOption}
          /> Import Project
          <div className={this.state.selectedOption !== 'import' ? 'deselected' : null} >
            {importControls}
          </div>
        </div>
      </div>
    )
  }
}

TileGenerationUiControls.propTypes = {
  labels: React.PropTypes.array,
  selectDataset: React.PropTypes.func,
  selectCustomDataset: React.PropTypes.func,
  importCustom: React.PropTypes.func,
  changeResolution: React.PropTypes.func,
  datasetSum: React.PropTypes.number,
  metricDomain: React.PropTypes.array,
  tileFilename: React.PropTypes.string,
  resetImportedTiles: React.PropTypes.func,
  usingImportedtiles: React.PropTypes.bool,
  editing: React.PropTypes.bool,
}

TileGenerationUiControls.defaultProps = {
  labels: [],
  selectDataset: () => {},
  selectCustomDataset: () => {},
  importCustom: () => {},
  changeResolution: () => {},
  resetImportedTiles: () => {},
  usingImportedtiles: false,
  editing: false,
}
