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

  componentDidMount() {
    this._triggerChange(50, {normalized: true}) // reset slider to 50
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
      this.normalizeValue.domain(nextProps.metricDomain) // update the domain
      this._triggerChange(50, {normalized: true})
    }
  }

  _toSignificant(number) {
    return parseFloat(number.toPrecision(2))
  }

  _triggerChange(value, options) {
    /**
     * changed can be triggered either
     * 1) with a normalized value (in the range of this._normalizeValue) or
     * 2) with a denormalized value (in the domain of this._normalizeValue)
     * the first case is primarily for the slider
     * the second case is for the typed box
     * note: the value displayed in the input box is always the value passed
     * to the props.onChange handler so that it is the source of truth
     * for the hexagon metrics
     */
    options = options || {normalized: false}
    if (options.normalized) {
      const deNormalizedValue = this._toSignificant(this.normalizeValue.invert(value))
      this.setState({value, typedValue: deNormalizedValue})
      this.props.onChange(deNormalizedValue)
    } else {
      const normalizedValue = this._toSignificant(this.normalizeValue(value))
      this.setState({value: normalizedValue, typedValue: value})
      this.props.onChange(value)
    }
  }

  _triggerChangeFromText() {
    const min = this.props.metricDomain[0]
    const max = this.props.metricDomain[1]
    if (this.state.typedValue < min) {
      this._triggerChange(min)
    } else if (this.state.typedValue > max) {
      this._triggerChange(max)
    } else {
      const typedAsFloat = parseFloat(this.state.typedValue)
      this._triggerChange(typedAsFloat)
    }
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
        <fieldset>
          <label htmlFor='resolutionSlider'>Resolution</label>
          <input
            id='resolutionSlider'
            type='range'
            min={1}
            max={99}
            onChange={(event) => this._triggerChange(event.target.value, {normalized: true})}
            value={this.state.value}
          />
          <br />
          <br />
          <label htmlFor='resolutionInput'>Per tile:</label>
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
