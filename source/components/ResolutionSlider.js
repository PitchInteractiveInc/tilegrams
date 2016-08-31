import React from 'react'
import {scaleLinear} from 'd3-scale'

import {tileEdgeRange} from '../constants'

const normalizeValue = scaleLinear()
  .domain([tileEdgeRange.min, tileEdgeRange.max])
  .range([0, 100])

export default class ResolutionSlider extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: normalizeValue(tileEdgeRange.default),
    }
  }

  _onChange(event) {
    this.props.onChange(normalizeValue.invert(event.target.value))
  }

  render() {
    return (
      <fieldset>
        <label htmlFor='resolutionSlider'>Resolution</label>
        <input
          id='resolutionSlider'
          type='range'
          min={0}
          max={100}
          onChange={(event) => this._onChange(event)}
        />
      </fieldset>
    )
  }
}
ResolutionSlider.propTypes = {
  onChange: React.PropTypes.func,
}
ResolutionSlider.defaultProps = {
  onChange: () => {},
}
