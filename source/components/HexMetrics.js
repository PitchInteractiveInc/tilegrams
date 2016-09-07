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
    let shouldWarn = false
    const stats = this._getCountsByGeo(this.props.tiles, this.props.geos).map((d) => {
      const metric = inputHash[d.key]
      const stat = {key: d.key, nHex: d.value}
      if (metric) {
        const idealNHex = Math.round(metric / selectedRatio)
        if (idealNHex === 0) {
          shouldWarn = true
        }
        stat.idealNHex = idealNHex
        stat.metric = metric
        stat.deviation = idealNHex - d.value
      }
      return stat
    })
    return {stats, shouldWarn}
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

  _renderWarning(shouldWarn) {
    if (!shouldWarn) {
      return null
    }
    return (
      <div id='warning'>
        <i className='fa fa-exclamation-triangle' />
        At this data resolution, some states will not be represented.
        Consider a lower resolution.
      </div>
    )
  }

  _renderHexCount(metrics) {
    if (!metrics.length) return null
    const rows = metrics.map((count) => {
      const adjustString = count.deviation > 0 ? `+${count.deviation}` : count.deviation
      const warn = (count.idealNHex === 0 && count.nHex === 0) ?
        <i className='fa fa-exclamation-triangle' /> :
        null
      return (
        <tr
          key={count.key}
          id={count.key}
          className={count.deviation === 0 ? 'fade' : null}
          onMouseOver={event => this.props.onMetricMouseOver(event.currentTarget.id)}
          onMouseOut={this.props.onMetricMouseOut}
        >
          <td>{warn}</td>
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
    const metrics = this._getMetrics()
    return (
      <div>
        <div id='metrics-header'>
          State Tiles
          {this._renderWarning(metrics.shouldWarn)}
        </div>
        {this._renderHexCount(metrics.stats)}
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
