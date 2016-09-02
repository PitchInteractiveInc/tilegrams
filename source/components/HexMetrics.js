import React, {PropTypes} from 'react'
import {nest} from 'd3-collection'

import {fipsColor, hashFromData, fipsToPostal} from '../utils'

export default class HexMetrics extends React.Component {
  constructor(props) {
    super(props)

    this._mouseDown = this._mouseDown.bind(this)
  }

  _getCountsByGeo(tiles, geos) {
    const counts = nest()
      .key((d) => d.id)
      .rollup((values) => values.length)
      .entries(tiles)
    const countHash = hashFromData(counts)
    return geos.map((geo) => {
      return {
        key: geo,
        value: countHash[geo] || 0,
      }
    }).sort((a, b) => a.key - b.key)
  }

  _getMetrics() {
    if (!this.props.dataset) {
      return (
        this._getCountsByGeo(this.props.tiles, this.props.geos).map((d) => {
          return {
            key: d.key,
            nHex: d.value,
          }
        })
      )
    }
    const input = this.props.dataset.map(row => ({key: row[0], value: +row[1]}))
    const inputHash = hashFromData(input)
    const selectedRatio = this.props.metricPerTile
    const stats = this._getCountsByGeo(this.props.tiles, this.props.geos).map((d) => {
      const metric = inputHash[d.key]
      const stat = {key: d.key, nHex: d.value}
      if (metric) {
        stat.metric = metric
        stat.ratio = d.value > 0 ? (metric / d.value).toFixed(2) : null
        stat.deviation = Math.round(metric / selectedRatio) - d.value
      }
      return stat
    })
    return {stats, selectedRatio}
  }

  _drawHexagon(id) {
    const width = 15
    const height = (Math.sqrt(3) / 2) * width
    const vertices = [
      [width * 0.25, 0],
      [width * 0.75, 0],
      [width, height * 0.5],
      [width * 0.75, height],
      [width * 0.25, height],
      [0, height / 2],
    ]
    return (
      <svg width={width} height={height}>
        <polygon
          fill={fipsColor(id)}
          points={vertices.map((pt) => pt.join(',')).join(' ')}
        />
      </svg>
    )
  }

  _mouseDown(event) {
    event.preventDefault()
    this.props.onAddTileMouseDown(event.currentTarget.parentElement.id)
  }

  _renderHexCount(metrics) {
    if (!metrics.length) return null
    const rows = metrics.map((count) => {
      const adjustString = count.deviation > 0 ? `+${count.deviation}` : count.deviation
      const rowClass = count.deviation === 0 ? 'fade' : null
      return (
        <tr
          key={count.key}
          id={count.key}
          className={rowClass}
          onMouseOver={event => this.props.onMetricMouseOver(event.currentTarget.id)}
          onMouseOut={this.props.onMetricMouseOut}
        >
          <td>{fipsToPostal(count.key)}</td>
          <td>{adjustString}</td>
          <td
            style={{cursor: 'pointer'}}
            onMouseDown={this._mouseDown}
          >
            {this._drawHexagon(count.key)}
          </td>
        </tr>
      )
    })
    return (
      <table>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  render() {
    const stats = this._getMetrics().stats
    return (
      <div>
        <div id='metrics-header'>State Tiles</div>
        {this._renderHexCount(stats)}
      </div>
    )
  }
}

HexMetrics.propTypes = {
  dataset: PropTypes.array,
  tiles: PropTypes.array,
  geos: PropTypes.array,
  metricPerTile: PropTypes.number,
  originalTilesLength: PropTypes.number,
  onAddTileMouseDown: PropTypes.func,
  onMetricMouseOut: PropTypes.func,
  onMetricMouseOver: PropTypes.func,
}
