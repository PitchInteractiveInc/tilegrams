import React from 'react'
import geographyResource from '../resources/GeographyResource'

const CUSTOM_LABEL = 'Custom CSV'

export default class DatasetSelector extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: 0,
      csvInputValue: '',
    }

    this._onCsvChange = this._onCsvChange.bind(this)
    this._submitCustomCsv = this._submitCustomCsv.bind(this)
  }

  _onSelect(event) {
    const selectedIndex = event.target.value
    this.setState({selectedIndex, csvInputValue: ''})
    if (!this._isCustomSelection(selectedIndex)) {
      this.props.onDatasetSelected(selectedIndex)
    } else {
      this.props.onResizeNeeded()
    }
  }

  _onCsvChange(event) {
    const csvInputValue = event.target.value
    this.setState({csvInputValue})
  }

  _submitCustomCsv() {
    if (this.state.csvInputValue) {
      this.props.onCustomDataset(this.state.csvInputValue)
    }
  }

  /** Return true if user has selected 'Custom' option */
  _displayCsvInput() {
    return this._isCustomSelection()
  }

  /** Return true if index is the 'Custom' option */
  _isCustomSelection(index) {
    return parseInt(index || this.state.selectedIndex, 10) === this.props.labels.length
  }

  _renderMenu() {
    const labels = this.props.labels.concat([CUSTOM_LABEL])
    const datasets = labels.map((label, index) => {
      return <option key={label} value={index}>{label}</option>
    })
    return (
      <select
        id='dataset-selector'
        className='dataset-select'
        value={this.state.selectedIndex}
        onChange={(event) => this._onSelect(event)}
      >
        {datasets}
      </select>
    )
  }

  /** Builds custom csv from geos to help users input good data */
  _generateSampleCsv() {
    const geos = geographyResource.getMapResource(this.props.geography).getUniqueFeatureIds()
    const geoHash = geographyResource.getGeoCodeHash(this.props.geography)
    const sampleCsv = geos.reduce((a, b) => `${a}${b},1,${geoHash[b].name}\n`, '')
    return (
      <div className='code'>
        {sampleCsv}
      </div>
    )
  }

  _renderCsvInput() {
    return (
      <div className='csv-input'>
        <div className='instruction'>
          {`Csv should be formatted with no
          headers and geo id as the first column and value as second.
          The third column is ignored. Sample CSV:`}
          {this._generateSampleCsv()}
          Paste custom CSV below:
        </div>
        <textarea
          ref={(ref) => { this.csvInput = ref }}
          rows={5}
          onChange={this._onCsvChange}
          onBlur={this._submitCustomCsv}
          value={this.state.csvInputValue || ''}
        />
      </div>
    )
  }

  render() {
    let csvInput
    if (this._displayCsvInput()) {
      csvInput = this._renderCsvInput()
    }
    return (
      <fieldset>
        {this._renderMenu()}
        {csvInput}
      </fieldset>
    )
  }
}
DatasetSelector.propTypes = {
  labels: React.PropTypes.array,
  onDatasetSelected: React.PropTypes.func,
  onCustomDataset: React.PropTypes.func,
  onResizeNeeded: React.PropTypes.func,
  geography: React.PropTypes.string,
}
DatasetSelector.defaultProps = {
  labels: [],
  onDatasetSelected: () => {},
  onCustomDataset: () => {},
  onResizeNeeded: () => {},
}
