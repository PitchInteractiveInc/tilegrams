import React from 'react'
import * as d3 from 'd3'
import {csvParseRows} from 'd3-dsv'

import {fipsColor} from '../../utils'

export default class HexCount extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      inputValue: '',
    }
  }

  _getCountsByGeo(tiles, geos) {
    const counts = d3.nest()
      .key((d) => d.id )
      .rollup((values) => values.length)
      .entries(tiles)
    const countHash = counts.reduce((map, count) => {
      map[count.key] = count.value
      return map
    })
    return geos.map((geo) => {
      return {
        key: geo,
        value: countHash[geo] || 0
      }
    }).sort((a,b) => a.key - b.key)
  }

  _updateMetrics(event) {
    if (event) {
      this.setState({
        inputValue: event.target.value
      })
    }
  }

  _parseInput(inputData) {
    return csvParseRows(inputData, (d) => ( [d[0], +d[1]] ))
  }

  _createHashFromInput(data) {
    const dataHash = {}
    data.forEach((row) => { dataHash[row[0]] = row[1] })
    return dataHash
  }

  _getMetrics(inputData) {
    if (!inputData) {
      return (
        this._getCountsByGeo(this.props.tiles, this.props.geos).map((d) => {
          return {
            key: d.key,
            nHex: d.value
          }
        })
      )
    }
    const input = this._parseInput(inputData)
    const inputHash = this._createHashFromInput(input)
    const idealRatio = d3.sum(input, (d) => d[1]) / this.props.originalTilesLength
    return (
      this._getCountsByGeo(this.props.tiles, this.props.geos).map((d) => {
        const metric = inputHash[d.key]
        const stats = {key: d.key, nHex: d.value}
        if (metric) {
          stats.metric = metric
          stats.ratio = d.value > 0 ? (metric / d.value).toFixed(2) : null
          stats.deviation = d.value - Math.round(metric / idealRatio)
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

  _renderHexCount(metrics) {
    if (!metrics.length) return null

    const headerTitles = ['ADD HEX', 'GEO_ID', 'HEXAGONS']
    if (this.state.inputValue.length) {
      headerTitles.push('METRIC', 'N/HEXAGON', 'Deviation')
    }
    const headers = headerTitles.map((header) => {
      return <th key={header}>{header}</th>
    })

    const rows = metrics.map((count) => {
      const metric = isNaN(count.metric) ? <td /> : <td>{count.metric}</td>
      const ratio = isNaN(count.ratio) ? <td /> : <td>{count.ratio}</td>
      const deviation = isNaN(count.deviation) ? <td /> : <td>{count.deviation}</td>
      return (
        <tr key={count.key}>
          <td
            style={{cursor: 'pointer'}}
            id={count.key}
            onMouseDown={this.props.onAddTileMouseDown}>
            {this._drawHexagon(count.key)}
          </td>
          <td>{count.key}</td>
          <td>{count.nHex}</td>
          {metric}
          {ratio}
          {deviation}
        </tr>
      )
    })
    return (
      <table>
        <tbody>
          <tr>
            {headers}
          </tr>
          {rows}
        </tbody>
      </table>
    )
  }

  render() {
    let metrics = this._getMetrics(this.state.inputValue)
    return (
      <div>
        {this._renderHexCount(metrics)}
        <div id='input-data'>
          Paste CSV here:
          <br />
          <textarea
            rows={5}
            onChange={this._updateMetrics.bind(this)}
            value={this.state.inputValue || ''}
          />
        </div>
      </div>
    )
  }
}
