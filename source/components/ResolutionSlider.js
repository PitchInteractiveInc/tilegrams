import React from 'react'
import {scaleLog} from 'd3-scale'

export default class ResolutionSlider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 50,
      typedValue: '',
    }
    this.normalizeValue = scaleLog().domain(this.props.metricDomain).range([1, 99])
    this._triggerChangeFromText = this._triggerChangeFromText.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.metricDomain) !== JSON.stringify(this.props.metricDomain)) {
      this.normalizeValue.domain(nextProps.metricDomain) // update the domain
      this._triggerChangeFromSlider(50)
    }
  }

  _toSignificant(number) {
    return parseFloat(number.toPrecision(2))
  }

  /**
   * note: the value displayed in the input box is always the value passed
   * to the props.onChange handler so that it is the source of truth
   * for the hexagon metrics
   */
  _triggerChange(value) {
    this.props.onChange(value)
  }

  _triggerChangeFromSlider(value) {
    const deNormalizedValue = this._toSignificant(this.normalizeValue.invert(value))
    this.setState({value, typedValue: deNormalizedValue})
    this._triggerChange(deNormalizedValue)
  }

  _triggerChangeFromText() {
    const min = this.props.metricDomain[0]
    const max = this.props.metricDomain[1]
    let sanitizedValue = null
    if (this.state.typedValue < min) {
      sanitizedValue = min
    } else if (this.state.typedValue > max) {
      sanitizedValue = max
    } else {
      sanitizedValue = parseFloat(this.state.typedValue)
    }
    const normalizedValue = this.normalizeValue(sanitizedValue)
    this.setState({value: normalizedValue, typedValue: sanitizedValue})
    this._triggerChange(sanitizedValue)
  }

  _checkForEnter(event) {
    if (event.keyCode !== 13) return
    this.typedInput.blur()
  }

  _setStateFromText(typedValue) {
    this.setState({typedValue})
  }

  render() {
    return (
      <div>
        <fieldset className='resolution-slider'>
          <label htmlFor='resolutionSlider'>Resolution</label>
          <input
            type='range'
            min={1}
            max={99}
            onChange={(event) => this._triggerChangeFromSlider(event.target.value)}
            value={this.state.value}
          />
        </fieldset>
        <fieldset className='resolution-input'>
          <label htmlFor='resolutionInput'>Per tile</label>
          <input
            ref={(ref) => { this.typedInput = ref }}
            type='text'
            value={this.state.typedValue}
            onChange={(event) => this._setStateFromText(event.target.value)}
            onBlur={this._triggerChangeFromText}
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
