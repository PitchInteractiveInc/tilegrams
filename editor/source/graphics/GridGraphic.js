import Graphic from './Graphic'
import {fipsColor} from '../utils'
import hexagonGrid from '../HexagonGrid'

const TILE_DIMENSIONS = hexagonGrid.getTileDimensions()
const SHRINKAGE = 0.9

export default class GridGraphic extends Graphic {
  onMouseDown(event) {
    if (this._tiles) {
      const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
      const tile = this._findTile(position)
      this._draggingTile = tile
    }
  }

  onMouseUp(event) {
    if (this._tiles) {
      const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
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

  _findTile(position) {
    return this._tiles.find(tile => {
      return tile.position.x == position.x && tile.position.y == position.y
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
          position: {x, y}
        })
      }
    })
    return this._tiles
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
    this._ctx.moveTo(
      center.x - SHRINKAGE * TILE_DIMENSIONS.width * 0.25,
      center.y - SHRINKAGE * TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.lineTo(
      center.x + SHRINKAGE * TILE_DIMENSIONS.width * 0.25,
      center.y - SHRINKAGE * TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.lineTo(
      center.x + SHRINKAGE * TILE_DIMENSIONS.width * 0.5,
      center.y
    )
    this._ctx.lineTo(
      center.x + SHRINKAGE * TILE_DIMENSIONS.width * 0.25,
      center.y + SHRINKAGE * TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.lineTo(
      center.x - SHRINKAGE * TILE_DIMENSIONS.width * 0.25,
      center.y + SHRINKAGE * TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.lineTo(
      center.x - SHRINKAGE * TILE_DIMENSIONS.width * 0.5,
      center.y
    )
    this._ctx.lineTo(
      center.x - SHRINKAGE * TILE_DIMENSIONS.width * 0.25,
      center.y - SHRINKAGE * TILE_DIMENSIONS.height * 0.5
    )
    this._ctx.closePath()
    this._ctx.fillStyle = fill
    this._ctx.fill()
    this._ctx.strokeStyle = superstroke ? '#333333' : '#f0f0f0'
    this._ctx.lineWidth = superstroke ? 3 : 1
    this._ctx.stroke()
  }
}
