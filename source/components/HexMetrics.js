import React, {PropTypes} from 'react'
import {nest} from 'd3-collection'

import {fipsColor, hashFromData, fipsToPostal} from '../utils'

export default class HexMetrics extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      metrics: {
        stats: [],
        shouldWarn: false,
      },
      hideNullStats: false,
      draggingHex: null,
      mouseX: 0,
      mouseY: 0,
    }
    this._mouseDown = this._mouseDown.bind(this)
    this._toggleHide = this._toggleHide.bind(this)
    this._updateMousePosition = this._updateMousePosition.bind(this)
    this._cancelDragging = this._cancelDragging.bind(this)
  }

  componentDidMount() {
    document.body.addEventListener('mousemove', this._updateMousePosition)
    document.body.addEventListener('mouseup', this._cancelDragging)
    document.getElementById('ui').addEventListener('mouseleave', this._cancelDragging)
    this._updateMetricsFromProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this._updateMetricsFromProps(nextProps)
  }

  componentWillUnmount() {
    document.body.removeEventListener('mousemove', this._updateMousePosition)
    document.body.removeEventListener('mouseup', this._cancelDragging)
    document.getElementById('ui').removeEventListener('mouseleave', this._cancelDragging)
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

  _toggleHide() {
    this.setState({
      hideNullStats: !this.state.hideNullStats,
    })
  }

  _updateMetricsFromProps(props) {
    const input = props.dataset.map(row => ({key: row[0], value: +row[1]}))
    const inputHash = hashFromData(input)
    const selectedRatio = props.metricPerTile
    let shouldWarn = false
    let nErrors = 0
    const stats = this._getCountsByGeo(props.tiles, props.geos).map((d) => {
      const metric = inputHash[d.key]
      const stat = {key: d.key, nHex: d.value, disable: !metric}
      if (metric) {
        const idealNHex = Math.round(metric / selectedRatio)
        if (idealNHex === 0) {
          shouldWarn = true
        }
        stat.idealNHex = idealNHex
        stat.metric = metric
        stat.deviation = d.value - idealNHex
        if (stat.deviation !== 0) {
          nErrors++
        }
      }
      return stat
    })

    props.updateNErrors(nErrors)

    this.setState({
      metrics: {stats, shouldWarn},
    })
  }

  _drawHexagon(id, dragging) {
    const height = dragging ? 20 : 18
    const width = (Math.sqrt(3) / 2) * height
    const vertices = [
      [width * 0.5, 0],
      [width, height * 0.25],
      [width, height * 0.75],
      [width * 0.5, height],
      [0, height * 0.75],
      [0, height * 0.25],
    ]
    return (
      <svg width={width + 2} height={height + 2}>
        <polygon
          transform={'translate(1,1)'}
          fill={fipsColor(id)}
          points={vertices.map((pt) => pt.join(',')).join(' ')}
        />
      </svg>
    )
  }

  _mouseDown(event) {
    event.preventDefault()
    const id = event.currentTarget.parentElement.id
    this.props.onAddTileMouseDown(id)
    this.setState({draggingHex: id})
  }

  _updateMousePosition(event) {
    this.setState({
      mouseX: event.clientX,
      mouseY: window.scrollY + event.clientY,
    })
  }

  _cancelDragging() {
    this.setState({
      draggingHex: null,
    })
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
    const boxes = metrics.map((count) => {
      const adjustString = count.deviation > 0 ? `+${count.deviation}` : count.deviation
      const warn = (count.idealNHex === 0 && count.nHex === 0) ?
        <i className='fa fa-exclamation-triangle' /> :
        null

      let className = count.deviation === 0 ? 'metrics-box fade' : 'metrics-box'
      if (count.disable) { className += ' disabled' }

      return (
        <div
          key={count.key}
          id={count.key}
          className={className}
          onMouseOver={event => this.props.onMetricMouseOver(event.currentTarget.id)}
          onMouseOut={this.props.onMetricMouseOut}
        >
          <div>{warn}</div>
          <div
            style={{cursor: 'pointer'}}
            onMouseDown={count.disable ? () => {} : this._mouseDown}
          >
            {count.disable ? 'No Data' : this._drawHexagon(count.key)}
          </div>
          <div>{fipsToPostal(count.key)}</div>
          <div>{adjustString}</div>
        </div>
      )
    })
    return (
      <div className='metrics-wrapper'>
        {boxes}
      </div>
    )
  }

  render() {
    const metrics = this.state.metrics
    const hexClass = this.state.hideNullStats ? 'metrics hide-null' : 'metrics'
    const draggingHex = this.state.draggingHex
      ? this._drawHexagon(this.state.draggingHex, true)
      : null
    return (
      <div className={hexClass}>
        <div
          className='dragging-hex'
          style={{top: this.state.mouseY, left: this.state.mouseX}}
        >
          {draggingHex}
        </div>
        <div id='metrics-header'>
          <input
            type='checkbox'
            id='toggleNull'
            checked={this.state.hideNullStats}
            onClick={this._toggleHide}
          />
          <label htmlFor='toggleNull'>
            Only show states with surplus/deficit.
          </label>
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
  onAddTileMouseDown: PropTypes.func,
  onMetricMouseOut: PropTypes.func,
  onMetricMouseOver: PropTypes.func,
  updateNErrors: PropTypes.func,
}
