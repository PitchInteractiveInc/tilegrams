import React from 'react'

import {tileEdgeRange} from '../constants'

export default class ResolutionSlider extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: this._normalizeValue(tileEdgeRange.default),
    }
  }

  /** Scale from domain range to 0-100 */
  _normalizeValue(value) {
    return Math.round(
      (value - tileEdgeRange.min) /
      (tileEdgeRange.max - tileEdgeRange.min)
    ) * 100
  }

  /** Scale from 0-100 to domain range */
  _denormalizeValue(value) {
    return Math.round(
      (value / 100.0) *
      (tileEdgeRange.max - tileEdgeRange.min) +
      tileEdgeRange.min
    )
  }

  _onChange(event) {
    this.props.onChange(this._denormalizeValue(event.target.value))
  }

  render() {
    return (
      <fieldset>
        <label>Resolution</label>
        <input
          type="range"
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
