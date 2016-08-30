import React from 'react'

export default class DatasetSelector extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: 0,
    }
  }

  _onChange(event) {
    const selectedIndex = event.target.value
    this.setState({selectedIndex})
    this.props.onDatasetSelected(selectedIndex)
  }

  render() {
    const datasets = this.props.labels.map((label, index) => {
      return <option key={label} value={index}>{label}</option>
    })
    const menu = (
      <select
        value={this.state.selectedIndex}
        onChange={(event) => this._onChange(event)}>
        {datasets}
      </select>
    )
    return (
      <fieldset>
        <label>Dataset</label>
        {menu}
      </fieldset>
    )
  }
}
DatasetSelector.propTypes = {
  labels: React.PropTypes.array,
  onDatasetSelected: React.PropTypes.func,
}
DatasetSelector.defaultProps = {
  labels: [],
  onDatasetSelected: () => {},
}
