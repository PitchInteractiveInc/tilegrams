import Graphic from './Graphic'
import {fipsColor} from '../utils'
import hexagonGrid from '../HexagonGrid'
import {selectedTileBorderColor} from '../constants'

export default class GridGraphic extends Graphic {
  constructor() {
    super()
    this.originalTilesLength = 0
    this._highlights = []
    document.body.onkeydown = this.onkeydown.bind(this)
  }

  onMouseDown(event) {
    event.preventDefault()
    if (this._tiles) {
      const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
      const tile = this._findTile(position)
      /** Deselect if clicking on null tile, otherwise select tile and/or allow drag */
      if ((this._selectedTile && tile == null) || tile == null) {
        this._selectedTile = null
        return
      }
      if (this._selectedTile !== tile) this._selectedTile = tile
      this._selectedTile.shouldDrag = true
    }
  }

  onMouseUp(event) {
    if ((this._selectedTile && !this._selectedTile.shouldDrag) || !this._selectedTile) {
      return
    }

    const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
    const tile = this._findTile(position)

    this._selectedTile.shouldDrag = false
    if (this._selectedTile && tile == null) {
      this._selectedTile.position = position
      if (this._selectedTile === this._newTile) {
        /** add new tile to list of tiles only once it's successfully added to the canvas */
        this._tiles.push(this._newTile)
        this.updateUi()
        this._newTile = null
      }
    } else if (this._selectedTile === this._newTile) {
      /** if new tile is placed on top of another title, reset new and selected tile */
      this._newTile = null
      this._selectedTile = null
    }
  }

  bodyOnMouseUp() {
    if (this._selectedTile && this._selectedTile.shouldDrag) {
      this._selectedTile.shouldDrag = false
      if (this._selectedTile === this._newTile) this._selectedTile = null
      this._newTile = null
    }
  }

  onMouseMove(event) {
    if (this._tiles) {
      this._mouseAt = {
        x: event.offsetX,
        y: event.offsetY,
      }
    }
  }

  onHighlightGeo(id) {
    this._highlights = this._tiles.filter((tile) => tile.id === id)
  }

  resetHighlightedGeo() {
    this._highlights = []
  }

  onkeydown(event) {
    const key = event.keyCode || event.charCode
    if (key === 8 || key === 46) {
      if (this._selectedTile) {
        this._deleteTile(this._selectedTile)
        this.updateUi()
        this._selectedTile = null
      }
      return
    }
  }

  onChange(callback) {
    this._onChangeCallback = callback
  }

  _deselectTile() {
    if (this._selectedTile) {
      this._selectedTile.shouldDrag = false
      this._selectedTile = null
    }
  }

  onAddTileMouseDown(id) {
    this._deselectTile()
    this._newTile = {
      id,
      position: {
        x: null,
        y: null,
      },
      shouldDrag: true,
    }
    this._mouseAt = {x: -1, y: -1}
    this._selectedTile = this._newTile
  }

  _deleteTile(selected) {
    this._tiles = this._tiles.filter((tile) => {
      return tile.position.x !== selected.position.x || tile.position.y !== selected.position.y
    })
  }

  /** Populate tiles based on given TopoJSON-backed map graphic */
  populateTiles(mapGraphic) {
    this._tiles = []
    hexagonGrid.forEachTilePosition((x, y) => {
      const point = hexagonGrid.tileCenterPoint({x, y})
      const feature = mapGraphic.getFeatureAtPoint(point)
      if (feature) {
        this._tiles.push({
          id: feature.id,
          position: {x, y},
        })
      }
    })
    // save tiles length so the stats does not have a moving target
    this.originalTilesLength = this._tiles.length
    this.updateUi()
    return this._tiles
  }

  getTiles() {
    return this._tiles
  }

  getOriginalTilesLength() {
    return this.originalTilesLength
  }

  _findTile(position) {
    return this._tiles.find(tile => {
      return tile.position.x === position.x && tile.position.y === position.y
    })
  }

  render(ctx) {
    this._ctx = ctx
    this._tiles.forEach(tile => {
      let color = fipsColor(tile.id)
      if (tile === this._selectedTile) {
        color = '#cccccc'
      }
      this._drawTile(tile.position, color)
    })
    this._highlights.forEach(tile => {
      this._drawTile(tile.position, null, true)
    })
    if (this._selectedTile) {
      const position = this._selectedTile.shouldDrag ?
        hexagonGrid.rectToHexPosition(this._mouseAt.x, this._mouseAt.y) :
        this._selectedTile.position
      this._drawTile(
        position,
        fipsColor(this._selectedTile.id),
        true
      )
    }
  }

  /** http://www.redblobgames.com/hexagonGrids/hexagons/#basics */
  _drawTile(position, fill, superstroke) {
    const center = hexagonGrid.tileCenterPoint(position)
    this._ctx.beginPath()
    this._ctx.moveTo(...hexagonGrid.getUpperLeftPoint(center))
    this._ctx.lineTo(...hexagonGrid.getUpperRightPoint(center))
    this._ctx.lineTo(...hexagonGrid.getRightPoint(center))
    this._ctx.lineTo(...hexagonGrid.getLowerRightPoint(center))
    this._ctx.lineTo(...hexagonGrid.getLowerLeftPoint(center))
    this._ctx.lineTo(...hexagonGrid.getLeftPoint(center))
    this._ctx.closePath()
    if (fill) {
      this._ctx.fillStyle = fill
      this._ctx.fill()
    }
    if (superstroke) {
      this._ctx.strokeStyle = selectedTileBorderColor
      this._ctx.lineWidth = 3
      this._ctx.stroke()
    }
  }

  updateUi() {
    if (this._onChangeCallback) {
      this._onChangeCallback()
    }
  }
}
