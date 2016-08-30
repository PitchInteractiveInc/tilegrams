import React from 'react'
import * as d3 from 'd3'
import {csvParseRows} from 'd3-dsv'

import {fipsColor, hashFromData, fipsToPostal} from '../utils'

export default class HexCount extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  _getCountsByGeo(tiles, geos) {
    const counts = d3.nest()
      .key((d) => d.id )
      .rollup((values) => values.length)
      .entries(tiles)
    const countHash = hashFromData(counts)
    return geos.map((geo) => {
      return {
        key: geo,
        value: countHash[geo] || 0
      }
    }).sort((a,b) => a.key - b.key)
  }

  _getMetrics() {
    if (!this.props.dataset) {
      return (
        this._getCountsByGeo(this.props.tiles, this.props.geos).map((d) => {
          return {
            key: d.key,
            nHex: d.value
          }
        })
      )
    }
    const input = this.props.dataset.map(row => ({key: row[0], value: +row[1]}))
    const inputHash = hashFromData(input)
    const idealRatio = d3.sum(input, (d) => d.value) / this.props.originalTilesLength
    return (
      this._getCountsByGeo(this.props.tiles, this.props.geos).map((d) => {
        const metric = inputHash[d.key]
        const stats = {key: d.key, nHex: d.value}
        if (metric) {
          stats.metric = metric
          stats.ratio = d.value > 0 ? (metric / d.value).toFixed(2) : null
          stats.deviation = Math.round(metric / idealRatio) - d.value
        }
        return stats
      })
    )
  }

  _drawHexagon(id) {
    const width = 15
    const height = Math.sqrt(3)/2 * width
    const vertices = [
      [width * 0.25,0],
      [width * 0.75,0],
      [width, height * 0.5],
      [width * 0.75, height],
      [width * 0.25, height],
      [0, height / 2]
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
    return (event) => {
      event.preventDefault()
      this.props.onAddTileMouseDown(event.currentTarget.parentElement.id)
    }
  }

  _renderHexCount(metrics) {
    if (!metrics.length) return null
    const rows = metrics.map((count) => {
      const adjustString = isNaN(count.deviation) ? '' : count.deviation > 0 ? `+${count.deviation}` : count.deviation
      const adjust = <td>{adjustString}</td>
      const rowClass = count.deviation == 0 ? 'fade' : null
      return (
        <tr
          key={count.key}
          id={count.key}
          className={rowClass}
          onMouseOver={event => this.props.onMetricMouseOver(event.currentTarget.id)}
          onMouseOut={this.props.onMetricMouseOut} >
          <td>{fipsToPostal(count.key)}</td>
          {adjust}
          <td
            style={{cursor: 'pointer'}}
            onMouseDown={this._mouseDown(event)}
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
    let metrics = this._getMetrics()
    return (
      <div>
        <div id='metrics-header'>Adjustments</div>
        {this._renderHexCount(metrics)}
      </div>
    )
  }
}
