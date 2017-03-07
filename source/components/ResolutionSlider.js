import React from 'react'
import {scaleLog} from 'd3-scale'

import smallHex from '../images/small-hex.svg'
import bigHex from '../images/big-hex.svg'

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
    if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
      this.normalizeValue.domain(nextProps.metricDomain) // update the domain
      if (nextProps.defaultResolution) {
        this._triggerChangerFromDefault(nextProps.defaultResolution)
      } else {
        this._triggerChangeFromSlider(50)
      }
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
    let typedValue = this.state.typedValue
    if (typeof typedValue === 'string') {
      typedValue = parseFloat(typedValue.replace(/,/g, ''))
    }
    sanitizedValue = typedValue
    if (typedValue < min) {
      sanitizedValue = min
    } else if (typedValue > max) {
      sanitizedValue = max
    }
    if (isNaN(typedValue)) { // catch any bad values and reset
      sanitizedValue = min
    }
    const normalizedValue = this.normalizeValue(sanitizedValue)
    this.setState({value: normalizedValue, typedValue: sanitizedValue})
    this._triggerChange(sanitizedValue)
  }

  _triggerChangerFromDefault(defaultValue) {
    const normalizedValue = this.normalizeValue(defaultValue)
    this.setState({value: normalizedValue, typedValue: defaultValue})
    this._triggerChange(defaultValue)
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
          <img src={smallHex} className='small-hex hex-img' alt='smaller hexagons' />
          <img src={bigHex} className='big-hex hex-img' alt='bigger hexagons' />
          <input
            type='range'
            min={1}
            max={99}
            onChange={(event) => this._triggerChangeFromSlider(event.target.value)}
            value={this.state.value}
          />
        </fieldset>
        <fieldset className='resolution-input'>
          <input
            ref={(ref) => { this.typedInput = ref }}
            type='text'
            size='10'
            value={this.state.typedValue}
            onChange={(event) => this._setStateFromText(event.target.value)}
            onBlur={this._triggerChangeFromText}
            onKeyUp={(event) => this._checkForEnter(event)}
          />
          per tile
        </fieldset>
      </div>
    )
  }
}
ResolutionSlider.propTypes = {
  defaultResolution: React.PropTypes.number,
  metricDomain: React.PropTypes.array,
  onChange: React.PropTypes.func,
}
ResolutionSlider.defaultProps = {
  metricDomain: [],
  onChange: () => {},
}
