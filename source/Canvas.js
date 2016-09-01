import Stats from 'stats-js'

import GridGraphic from './graphics/GridGraphic'
import MapGraphic from './graphics/MapGraphic'
import {canvasDimensions, settings} from './constants'
import {createElement, isDevEnviornment} from './utils'

class Canvas {
  constructor() {
    this._createCanvas()
    this._requestRender()
    this._initStats()
    this._mapGraphic = new MapGraphic()
    this._gridGraphic = new GridGraphic()
    this._cartogramReady = false
  }

  computeCartogram(options) {
    this._mapGraphic.computeCartogram(options)
    this.updateTiles()
    this._cartogramReady = true
  }

  updateTiles() {
    this._gridGraphic.populateTiles(this._mapGraphic)
  }

  getGrid() {
    return this._gridGraphic
  }

  _createCanvas() {
    const container = createElement({id: 'canvas'})

    this._canvas = document.createElement('canvas')
    function setCanvasAttribute(canvas, key, value) {
      const attribute = document.createAttribute(key)
      attribute.value = value
      canvas.setAttributeNode(attribute)
    }
    setCanvasAttribute(this._canvas, 'width', canvasDimensions.width)
    setCanvasAttribute(this._canvas, 'height', canvasDimensions.height)
    this._canvas.style.width = `${canvasDimensions.width * 0.5}px`

    container.appendChild(this._canvas)
    this._ctx = this._canvas.getContext('2d')

    this._canvas.onmousedown = this._onMouseDown.bind(this)
    this._canvas.onmouseup = this._onMouseUp.bind(this)
    this._canvas.onmousemove = this._onMouseMove.bind(this)

    document.onmouseup = this._bodyOnMouseUp.bind(this)
  }

  /** stats.js fps indicator */
  _initStats() {
    this._stats = new Stats()
    this._stats.domElement.style.position = 'absolute'
    this._stats.domElement.style.right = 0
    this._stats.domElement.style.top = 0
    if (isDevEnviornment()) {
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

  _bodyOnMouseUp(event) {
    if (event.target === this._canvas) {
      return
    }
    this._gridGraphic.bodyOnMouseUp(event, this.ctx)
  }
}

export default new Canvas()
