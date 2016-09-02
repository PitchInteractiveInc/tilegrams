import React from 'react'
import {scaleLog} from 'd3-scale'

export default class ResolutionSlider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 50,
      typedValue: null,
    }
    this.normalizeValue = scaleLog().range([1, 100]).domain(this.props.metricDomain)
  }

  componentDidMount() {
    this._onChange(50) // fire onChange on mount
  }

  componentWillReceiveProps(nextProps) {
    this.normalizeValue.domain(nextProps.metricDomain)
    this.setState({typedValue: null})
  }

  _onChange(value) {
    this.setState({value})
    this.props.onChange(this.normalizeValue.invert(value))
  }

  _notifyChangeFromText() {
    const min = this.props.metricDomain[0]
    const max = this.props.metricDomain[1]
    if (this.state.typedValue < min) {
      this.setState({
        value: this.normalizeValue(min),
        typedValue: min,
      })
      this.props.onChange(min)
    } else if (this.state.typedValue > max) {
      this.setState({
        value: this.normalizeValue(max),
        typedValue: max,
      })
      this.props.onChange(max)
    } else {
      const typedAsFloat = parseFloat(this.state.typedValue)
      const typedToScaled = this.normalizeValue(typedAsFloat)
      this.setState({value: typedToScaled})
      this.props.onChange(typedAsFloat)
    }
  }

  _checkForEnter(event) {
    if (event.keyCode !== 13) return
    this._notifyChangeFromText()
  }

  _onChangeText(typedValue) {
    this.setState({typedValue})
  }

  render() {
    const nPerTile = (this.normalizeValue.invert(this.state.value))
    return (
      <div>
        <fieldset>
          <label htmlFor='resolutionSlider'>Resolution</label>
          <input
            id='resolutionSlider'
            type='range'
            min={1}
            max={100}
            onChange={(event) => this._onChange(event.target.value)}
            value={this.state.value}
          />
          <br />
          <br />
          <label>Per tile:</label>
          <input
            type='text'
            value={this.state.typedValue ? this.state.typedValue : nPerTile}
            onChange={(event) => this._onChangeText(event.target.value)}
            onBlur={this._notifyChangeFromText}
            onKeyUp={(event) => this._checkForEnter(event)}
          />
        </fieldset>
      </div>
    )
  }
}
ResolutionSlider.propTypes = {
  metricDomain: React.PropTypes.array,
  onChange: React.PropTypes.func,
}
ResolutionSlider.defaultProps = {
  metricDomain: [],
  onChange: () => {},
}
