const canvasColor = '#f0f0f0'
const canvasDimensions = {
  width: 1920 * 2,
  height: 1080 * 2,
}

export default class Canvas {
  constructor() {
    this._objects = []
    this._createCanvas()
    this._requestRender()
  }

  include(object) {
    this._objects.push(object)
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

  _requestRender() {
    requestAnimationFrame(this._render.bind(this))
  }

  _render(timestamp) {
    this._requestRender()
    this._renderBackground()
    this._objects.forEach(object => object.render(this._ctx))
  }

  _onMouseDown(event) {
    this._objects.forEach(object => object.onMouseDown(event, this._ctx))
  }

  _onMouseUp(event) {
    this._objects.forEach(object => object.onMouseUp(event, this._ctx))
  }

  _onMouseMove(event) {
    this._objects.forEach(object => object.onMouseMove(event, this._ctx))
  }

  _renderBackground() {
    this._ctx.fillStyle = canvasColor
    this._ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height)
  }
}
