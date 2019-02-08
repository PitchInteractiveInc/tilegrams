import Stats from 'stats-js'

import GridGraphic from './graphics/GridGraphic'
import MapGraphic from './graphics/MapGraphic'
import gridGeometry from './geometry/GridGeometry'
import metrics from './Metrics'
import {devicePixelRatio, canvasDimensions, settings} from './constants'
import {createElement, isDevEnvironment} from './utils'

class Canvas {
  constructor() {
    this._createCanvas()
    this._requestRender()
    this._initStats()
    this._mapGraphic = new MapGraphic()
    this._gridGraphic = new GridGraphic()
    this._cartogramReady = false
    this._cartogramArea = null
    this._progress = -1
  }

  setGeoCodeToName(geoCodeToName) {
    this._gridGraphic.geoCodeToName = geoCodeToName
  }

  computeCartogram(dataset) {
    this._mapGraphic.computeCartogram(dataset)
    this._setCartogramArea()
    this.updateTiles()
    this._cartogramReady = true
  }

  iterateCartogram(geography) {
    const [iterated, time] = this._mapGraphic.iterateCartogram(geography)
    if (iterated) {
      this._setCartogramArea()
    }
    this._progress = time;
    return [iterated, time]
  }

  importTiles(tiles) {
    this._mapGraphic.resetBounds()
    this._gridGraphic.importTiles(tiles)
    this._cartogramReady = true
  }

  updateTiles() {
    this._gridGraphic.populateTiles(this._mapGraphic)
  }

  updateTilesFromMetrics() {
    const idealHexArea =
      (this._cartogramArea * metrics.metricPerTile) / metrics.sumMetrics
    gridGeometry.setTileEdgeFromArea(idealHexArea)
    this.updateTiles()
  }

  _setCartogramArea() {
    this._cartogramArea = this._mapGraphic.computeCartogramArea()
  }

  getGrid() {
    return this._gridGraphic
  }

  getMap() {
    return this._mapGraphic
  }

  resize() {
    this._canvas.width = canvasDimensions.width
    this._canvas.height = canvasDimensions.height
    this._canvas.style.width = `${canvasDimensions.width / devicePixelRatio}px`
    if (this._gridGraphic) {
      this._gridGraphic.renderBackgroundImage()
    }
  }

  _createCanvas() {
    const container = createElement({id: 'canvas'})
    this._canvas = document.createElement('canvas')
    this.resize()

    container.appendChild(this._canvas)
    this._ctx = this._canvas.getContext('2d')

    this._canvas.onmousedown = this._onMouseDown.bind(this)
    this._canvas.onmouseup = this._onMouseUp.bind(this)
    this._canvas.onmousemove = this._onMouseMove.bind(this)
    this._canvas.ondblclick = this._onDoubleClick.bind(this)

    document.onmouseup = this._bodyOnMouseUp.bind(this)
  }

  /** stats.js fps indicator */
  _initStats() {
    this._stats = new Stats()
    this._stats.domElement.style.position = 'absolute'
    this._stats.domElement.style.right = 0
    this._stats.domElement.style.top = 0
    if (isDevEnvironment()) {
      document.body.appendChild(this._stats.domElement)
    }
  }

  _requestRender() {
    requestAnimationFrame(this._render.bind(this))
  }

  _render() {
    this._requestRender()
    this._stats.begin()
    this._ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height)

    if (this._cartogramReady) {
      if (settings.displayGrid) {
        this._gridGraphic.render(this._ctx)
      }
    }
    if (this._progress >= 0 && this._progress < 1) {
      this._ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      this._ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height)
      const fullBarWidth = Math.min(400, canvasDimensions.width / 3)
      const barX = (canvasDimensions.width / 2) - (fullBarWidth / 2);
      const progressBarWidth = this._progress * fullBarWidth
      const barHeight = 30
      const barY = (canvasDimensions.height / 2) - (barHeight / 2);
      this._ctx.fillStyle = '#fff';
      this._ctx.fillRect(barX, barY, fullBarWidth, barHeight);
      this._ctx.fillStyle = '#666';
      this._ctx.fillRect(barX, barY, progressBarWidth, barHeight)
      this._ctx.fillStyle = '#fff';

      this._ctx.textAlign = 'center'
      this._ctx.textBaseline = 'middle'
      this._ctx.font = `${16.0 * devicePixelRatio}px Fira Sans`

      const label = 'Computing Tilegram...'
      this._ctx.fillText(label, canvasDimensions.width / 2, barY - 16)
    }
    this._stats.end()
  }

  _onMouseDown(event) {
    this._gridGraphic.onMouseDown(event, this._ctx)
  }

  _onMouseUp(event) {
    this._gridGraphic.onMouseUp(event, this._ctx)
  }

  _onMouseMove(event) {
    this._gridGraphic.onMouseMove(event, this._ctx)
  }

  _onDoubleClick(event) {
    this._gridGraphic.onDoubleClick(event, this._ctx)
  }

  _bodyOnMouseUp(event) {
    if (event.target === this._canvas) {
      return
    }
    this._gridGraphic.bodyOnMouseUp(event, this.ctx)
  }
}

export default new Canvas()
