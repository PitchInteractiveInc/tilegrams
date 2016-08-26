const SIDE = 10
const TILE_DIMENSIONS = {
  width: 2.0 * SIDE,
  height: Math.sqrt(3.0) * SIDE
}
const TILE_OFFSET = 2

export default class Grid {
  constructor(tiles) {
    this._tiles = tiles
    document.body.onkeydown = this.onkeydown.bind(this)
  }

  onMouseDown(event) {
    const position = this._rectToHexPosition(event.offsetX, event.offsetY)
    const tile = this._findTile(position)
    /** Deselect if clicking on null tile, otherwise select tile and/or allow drag */
    if ((this._selectedTile && tile == null) || tile == null) {
      this._selectedTile = null
      return
    }
    if (this._selectedTile != tile) this._selectedTile = tile
    this._selectedTile.shouldDrag = true
  }

  onMouseUp(event) {
    if ((this._selectedTile && !this._selectedTile.shouldDrag) || !this._selectedTile) {
      return
    }
    this._selectedTile.shouldDrag = false
    const position = this._rectToHexPosition(event.offsetX, event.offsetY)
    const tile = this._findTile(position)
    if (this._selectedTile && tile == null) {
      this._selectedTile.position = position
    }
  }

  onMouseMove(event) {
    this._mouseAt = {
      x: event.offsetX,
      y: event.offsetY,
    }
  }

  onkeydown(event) {
    let key = event.keyCode || event.charCode
    if( key == 8 || key == 46 ) {
      if (this._selectedTile) {
        this._deleteTile(this._selectedTile)
        this._selectedTile = null
      }
      return
    }
  }

  _deselectTile() {
    if (this._selectedTile) {
      this._selectedTile.shouldDrag = false
      this._selectedTile = null
    }
  }

  onAddTileMouseDown(event) {
    this._deselectTile()
    this._newTile = {
      id: event.currentTarget.id,
      position: {
        x: null,
        y: null
      },
      shouldDrag: true
    }
    this._mouseAt = {x: -1, y: -1}
    this._tiles.push(this._newTile)
    this._selectedTile = this._newTile
  }

  onAddTileMouseUp() {
    if (this._newTile == this._selectedTile) this._selectedTile = null
    this._newTile = null
  }

  _deleteTile(selected) {
    this._tiles = this._tiles.filter((tile) => {
      return tile.position.x != selected.position.x || tile.position.y != selected.position.y
    })
  }

  _rectToHexPosition(rectX, rectY) {
    if (rectX < 0 && rectY < 0) return {x: null,y: null}
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
      if (tile == this._selectedTile) {
        color = '#cccccc'
      }
      this._drawTile(tile.position, color)
    })
    if (this._selectedTile) {
      let position = this._selectedTile.shouldDrag ?
        this._rectToHexPosition(this._mouseAt.x, this._mouseAt.y) :
        this._selectedTile.position
      this._drawTile(
        position,
        this._tileColor(this._selectedTile),
        true
      )
    }
  }

  /** http://www.redblobgames.com/grids/hexagons/#basics */
  _drawTile(position, fill, superstroke) {
    if (position.x == null && position.y == null) return
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
