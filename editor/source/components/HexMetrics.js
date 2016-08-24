import React from 'react'
import * as d3 from 'd3'

import {tiles} from '../../data/tile-coordinates.json'


export default class HexCount extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      metrics: [],
      inputValue: '',
    }
  }

  _getCountsByGeo(tiles) {
    const counts = d3.nest()
      .key((d) => d.id)
      .rollup((values) => values.length)
      .entries(tiles)
      .sort((a,b) => a.key - b.key)
    return (counts)
  }

  _updateMetrics(event) {
    const inputData = event.target.value
    this.setState({
      inputValue: inputData,
      metrics: this._getMetrics(inputData)
    })
  }

  _parseInput(inputData) {
    return d3.csvParseRows(inputData, (d) => ( [d[0], +d[1]] ))
  }

  _createHashFromInput(data) {
    const dataHash = {}
    data.forEach((row) => { dataHash[row[0]] = row[1] })
    return dataHash
  }

  _getMetrics(inputData) {
    const input = this._parseInput(inputData)
    const inputHash = this._createHashFromInput(input)
    const idealRatio = d3.sum(input, (d) => d[1]) / tiles.length
    return (
      this._getCountsByGeo(tiles).map((d) => {
        const metric = inputHash[d.key]
        return {
          key: d.key,
          nHex: d.value,
          metric: metric,
          ratio: (metric / d.value).toFixed(2),
          deviation: Math.round(d.value - metric / idealRatio)
        }
      })
    )
  }

  _renderHexCount() {
    if (!this.state.metrics.length) return null
    const rows = this.state.metrics.map((count) => {
      return (
        <tr key={count.key}>
          <td>{count.key}</td>
          <td>{count.nHex}</td>
          <td>{count.metric}</td>
          <td>{count.ratio}</td>
          <td>{count.deviation}</td>
        </tr>
      )
    })
    return (
      <table>
        <tbody>
          <tr>
            <th>ID</th>
            <th>HEXAGONS</th>
            <th>METRIC</th>
            <th>N PER HEXAGON</th>
            <th>Deviation</th>
          </tr>
          {rows}
        </tbody>
      </table>
    )
  }

  render() {
    return (
      <div>
        {this._renderHexCount()}
        <div>
          Paste CSV here:
          <br />
          <textarea
            rows={5}
            onChange={this._updateMetrics.bind(this)}
            value={this.state.inputValue}
          />
        </div>
      </div>
    )
  }
}