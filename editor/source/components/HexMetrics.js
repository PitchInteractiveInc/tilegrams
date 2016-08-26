import React from 'react'
import * as d3 from 'd3'

export default class HexCount extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      metrics: [],
      inputValue: '',
    }
  }

  componentWillMount() {
    this._updateMetrics()
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
    let inputData = !event ? null : event.target.value
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
    if (!inputData) {
      return (
        this._getCountsByGeo(this.props.tiles).map((d) => {
          return {
            key: d.key,
            nHex: d.value
          }
        })
      )
    }
    const input = this._parseInput(inputData)
    const inputHash = this._createHashFromInput(input)
    const idealRatio = d3.sum(input, (d) => d[1]) / this.props.tiles.length
    return (
      this._getCountsByGeo(this.props.tiles).map((d) => {
        const metric = inputHash[d.key]
        return {
          key: d.key,
          nHex: d.value,
          metric: metric,
          ratio: (metric / d.value).toFixed(2),
          deviation: d.value - Math.round(metric / idealRatio)
        }
      })
    )
  }

  _colorFromId(id) {
    return `hsl(${parseInt(id) * 700 % 25.5 * 10.0}, 80%, 60%)`
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
          fill={this._colorFromId(id)}
          points={vertices.map((pt) => pt.join(',')).join(' ')}
        />
      </svg>
    )
  }

  _renderHexCount() {
    if (!this.state.metrics.length) return null
    const rows = this.state.metrics.map((count) => {
      const metric = count.metric ? <td>{count.metric}</td> : <td />
      const ratio = count.ratio ? <td>{count.ratio}</td> : <td />
      const deviation = count.deviation ? <td>{count.deviation}</td> : <td />
      return (
        <tr key={count.key}>
          <td>{count.key}</td>
          <td>{count.nHex}</td>
          {metric}
          {ratio}
          {deviation}
          <td
            style={{cursor: 'pointer'}}
            id={count.key}
            onMouseDown={this.props.onAddTileMouseDown}
            onMouseUp={this.props.onAddTileMouseUp}>
            {this._drawHexagon(count.key)}
          </td>
        </tr>
      )
    })
    return (
      <table style={{textAlign: 'center'}}>
        <tbody>
          <tr>
            <th>GEO_ID</th>
            <th>HEXAGONS</th>
            <th>METRIC</th>
            <th>N PER HEXAGON</th>
            <th>Deviation</th>
            <th>ADD HEXAGON</th>
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
            value={this.state.inputValue || ''}
          />
        </div>
      </div>
    )
  }
}
