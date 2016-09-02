import React from 'react'

const CUSTOM_LABEL = 'Custom CSV'

export default class DatasetSelector extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: 0,
      csvInputValue: '',
    }

    this._onCustomCsv = this._onCustomCsv.bind(this)
  }

  _onSelect(event) {
    const selectedIndex = event.target.value
    this.setState({selectedIndex, csvInputValue: ''})
    if (!this._isCustomSelection(selectedIndex)) {
      this.props.onDatasetSelected(selectedIndex)
    }
  }

  _onCustomCsv(event) {
    const csvInputValue = event.target.value
    this.setState({csvInputValue})
    this.props.onCustomDataset(csvInputValue)
  }

  /** Return true if user has selected 'Custom' option but hasn't pasted yet */
  _displayCsvInput() {
    return this._isCustomSelection() && this.state.csvInputValue === ''
  }

  /** Return true if index is the 'Custom' option */
  _isCustomSelection(index) {
    return (index || parseInt(this.state.selectedIndex, 10)) === this.props.labels.length
  }

  _renderMenu() {
    const labels = this.props.labels.concat([CUSTOM_LABEL])
    const datasets = labels.map((label, index) => {
      return <option key={label} value={index}>{label}</option>
    })
    return (
      <select
        id='datasetSelectorSelect'
        value={this.state.selectedIndex}
        onChange={(event) => this._onSelect(event)}
      >
        {datasets}
      </select>
    )
  }

  _renderCsvInput() {
    return (
      <div>
        Paste CSV here:
        <br />
        <textarea
          rows={5}
          onChange={this._onCustomCsv}
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
        <label htmlFor='datasetSelectorSelect'>Dataset</label>
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
}
DatasetSelector.defaultProps = {
  labels: [],
  onDatasetSelected: () => {},
}
