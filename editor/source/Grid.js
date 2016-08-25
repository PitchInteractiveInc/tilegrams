const SIDE = 10
const TILE_DIMENSIONS = {
  width: 2.0 * SIDE,
  height: Math.sqrt(3.0) * SIDE
}
const TILE_OFFSET = 2

export default class Grid {
  constructor(tiles) {
    this._tiles = tiles
  }

  onMouseDown(event) {
    const position = this._rectToHexPosition(event.offsetX, event.offsetY)
    const tile = this._findTile(position)
    this._draggingTile = tile
  }

  onMouseUp(event) {
    const position = this._rectToHexPosition(event.offsetX, event.offsetY)
    const tile = this._findTile(position)
    if (this._draggingTile && tile == null) {
      this._draggingTile.position = position
    }
    this._draggingTile = null
  }

  onMouseMove(event) {
    this._mouseAt = {
      x: event.offsetX,
      y: event.offsetY,
    }
  }

  _rectToHexPosition(rectX, rectY) {
    const x = Math.round(rectX / (TILE_DIMENSIONS.width * 0.75 * 0.5))
    const y = Math.round(
      rectY / (TILE_DIMENSIONS.height * 0.5) -
      (x % 2 == 0 ? 0.5 : 0)
    )
    return {x, y}
  }

  _findTile(position) {
    return this._tiles.find(tile => {
      return tile.position.x == position.x && tile.position.y == position.y
    })
  }

  _tileColor(tile) {
    return `hsl(${parseInt(tile.id) * 700 % 25.5 * 10.0}, 80%, 60%)`
  }

  render(ctx) {
    this._ctx = ctx
    this._tiles.forEach(tile => {
      let color = this._tileColor(tile)
      if (tile == this._draggingTile) {
        color = '#cccccc'
      }
      this._drawTile(tile.position, color)
    })
    if (this._draggingTile) {
      this._drawTile(
        this._rectToHexPosition(this._mouseAt.x, this._mouseAt.y),
        this._tileColor(this._draggingTile),
        true
      )
    }
  }

  /** http://www.redblobgames.com/grids/hexagons/#basics */
  _drawTile(position, fill, superstroke) {
    const center = {
      x: (position.x + TILE_OFFSET) * (1.5 * SIDE),
      y: (position.y + TILE_OFFSET) * TILE_DIMENSIONS.height + (
          position.x % 2 == 0 ?
            TILE_DIMENSIONS.height * 0.5 :
            0.0
          ),
    }
    this._ctx.beginPath()
    this._ctx.moveTo(
      center.x - TILE_DIMENSIONS.width * 0.25,
      center.y - TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.lineTo(
      center.x + TILE_DIMENSIONS.width * 0.25,
      center.y - TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.lineTo(
      center.x + TILE_DIMENSIONS.width * 0.5,
      center.y
    )
    this._ctx.lineTo(
      center.x + TILE_DIMENSIONS.width * 0.25,
      center.y + TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.lineTo(
      center.x - TILE_DIMENSIONS.width * 0.25,
      center.y + TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.lineTo(
      center.x - TILE_DIMENSIONS.width * 0.5,
      center.y
    )
    this._ctx.lineTo(
      center.x - TILE_DIMENSIONS.width * 0.25,
      center.y - TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.closePath()
    this._ctx.fillStyle = fill
    this._ctx.fill()
    this._ctx.strokeStyle = superstroke ? '#333333' : '#f0f0f0'
    this._ctx.lineWidth = superstroke ? 3 : 1
    this._ctx.stroke()
  }
}
