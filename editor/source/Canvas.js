import Stats from 'stats-js'

import GridGraphic from './graphics/GridGraphic'
import MapGraphic from './graphics/MapGraphic'
import {canvasColor, canvasDimensions, settings} from './constants'

export default class Canvas {
  constructor(usTopoJson) {
    this._createCanvas()
    this._requestRender()
    this._initStats()

    this._mapGraphic = new MapGraphic(usTopoJson)
    this._gridGraphic = new GridGraphic()
    this.updateTiles()
  }

  updateTiles() {
    this._gridGraphic.populateTiles(this._mapGraphic)
  }

  getTiles() {
    return this._gridGraphic.getTiles()
  }

  _createCanvas() {
    const canvas = document.createElement('canvas')

    function setCanvasAttribute(key, value) {
      const attribute = document.createAttribute(key)
      attribute.value = value
      canvas.setAttributeNode(attribute)
    }
    setCanvasAttribute('width', canvasDimensions.width)
    setCanvasAttribute('height', canvasDimensions.height)
    canvas.style = `width: ${canvasDimensions.width * 0.5}px; cursor: pointer`

    document.body.appendChild(canvas)
    this._canvas = canvas
    this._ctx = canvas.getContext('2d')

    this._canvas.onmousedown = this._onMouseDown.bind(this)
    this._canvas.onmouseup = this._onMouseUp.bind(this)
    this._canvas.onmousemove = this._onMouseMove.bind(this)
  }

  /** stats.js fps indicator */
  _initStats() {
    this._stats = new Stats()
    this._stats.domElement.style.position = 'absolute'
    this._stats.domElement.style.left = 0
    this._stats.domElement.style.top = 0
    document.body.appendChild(this._stats.domElement)
  }

  _requestRender() {
    requestAnimationFrame(this._render.bind(this))
  }

  _render(timestamp) {
    this._requestRender()
    this._stats.begin()
    this._renderBackground()
    this.updateTiles()
    if (settings.displayMap) {
      this._mapGraphic.render(this._ctx)
    }
    if (settings.displayGrid) {
      this._gridGraphic.render(this._ctx)
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

  _renderBackground() {
    this._ctx.fillStyle = canvasColor
    this._ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height)
  }
}
