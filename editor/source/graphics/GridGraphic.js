import Graphic from './Graphic'
import {fipsColor} from '../utils'
import hexagonGrid from '../HexagonGrid'
import {selectedTileBorderColor} from '../constants'

export default class GridGraphic extends Graphic {
  onMouseDown(event) {
    if (this._tiles) {
      const position =
        hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
      const tile = this._findTile(position)
      this._draggingTile = tile
    }
  }

  onMouseUp(event) {
    if (this._tiles) {
      const position =
        hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
      const tile = this._findTile(position)
      if (this._draggingTile && tile == null) {
        this._draggingTile.position = position
      }
      this._draggingTile = null
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

  /** Populate tiles based on given TopoJSON-backed map graphic */
  populateTiles(mapGraphic) {
    this._tiles = []
    hexagonGrid.forEachTilePosition((x, y) => {
      const point = hexagonGrid.tileCenterPoint({x, y})
      const feature = mapGraphic.getFeatureAtPoint(point)
      if (feature) {
        this._tiles.push({
          id: feature.id,
          position: {x, y}
        })
      }
    })
    return this._tiles
  }

  _findTile(position) {
    return this._tiles.find(tile => {
      return tile.position.x == position.x && tile.position.y == position.y
    })
  }

  render(ctx) {
    this._ctx = ctx
    this._tiles.forEach(tile => {
      let color = fipsColor(tile.id)
      if (tile == this._draggingTile) {
        color = '#cccccc'
      }
      this._drawTile(tile.position, color)
    })
    if (this._draggingTile) {
      this._drawTile(
        hexagonGrid.rectToHexPosition(this._mouseAt.x, this._mouseAt.y),
        fipsColor(this._draggingTile.id),
        true
      )
    }
  }

  /** http://www.redblobgames.com/hexagonGrids/hexagons/#basics */
  _drawTile(position, fill, superstroke) {
    const center = hexagonGrid.tileCenterPoint(position)
    this._ctx.beginPath()
    this._ctx.moveTo.apply(this._ctx, hexagonGrid.getUpperLeftPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getUpperRightPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getRightPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getLowerRightPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getLowerLeftPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getLeftPoint(center))
    this._ctx.closePath()
    this._ctx.fillStyle = fill
    this._ctx.globalAlpha = 0.6
    this._ctx.fill()
    this._ctx.globalAlpha = 1.0
    if (superstroke) {
      this._ctx.strokeStyle = selectedTileBorderColor
      this._ctx.lineWidth = 3
      this._ctx.stroke()
    }
  }
}
