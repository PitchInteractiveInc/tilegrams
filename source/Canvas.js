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
  }

  computeCartogram(dataset, geography) {
    geography = geography || 'United States'
    this._mapGraphic.computeCartogram(dataset, geography)
    this._setCartogramArea()
    this.updateTiles(dataset)
    this._cartogramReady = true
  }

  iterateCartogram(geography) {
    geography = geography || 'United States'
    const iterated = this._mapGraphic.iterateCartogram(geography)
    if (iterated) {
      this._setCartogramArea()
    }
    return iterated
  }

  importTiles(tiles) {
    this._mapGraphic.resetBounds()
    this._gridGraphic.importTiles(tiles)
    this._cartogramReady = true
  }

  updateTiles(properties) {
    if (typeof properties !== 'undefined') {
      this._properties = properties
    }
    this._gridGraphic.populateTiles(this._mapGraphic, this._properties)
  }

  updateTilesFromMetrics() {
    console.log(this._cartogramArea)
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
