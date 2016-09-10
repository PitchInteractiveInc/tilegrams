/**
 * HexagonGrid: manage and convert hexagon coordinates
 *
 * Primary reference:
 * http://www.redblobgames.com/grids/hexagons/#coordinates
 */

import {canvasDimensions, tileScaleFromStyle, tileEdgeRange} from './constants'

const TILE_OFFSET = 1

// tile margins must be even to not break Importer._getTilePosition()
export const IMPORT_TILE_MARGINS = 10

class HexagonGrid {
  constructor() {
    this.setTileEdge(tileEdgeRange.default)
  }

  setTileEdge(tileEdge) {
    this._tileEdge = tileEdge
    this.resize()
  }

  getTileEdge() {
    return this._tileEdge
  }

  resize() {
    this._tileSize = {
      width: 2.0 * this._tileEdge,
      height: Math.sqrt(3.0) * this._tileEdge,
    }
    this._tileCounts = {
      width: Math.floor(
        (canvasDimensions.width / (this._tileSize.width * 0.75)) -
        (TILE_OFFSET * 2)
      ),
      height: Math.floor(
        (canvasDimensions.height / this._tileSize.height) - (TILE_OFFSET * 2)
      ),
    }
  }

  setTileEdgeFromMax(maxX, maxY) {
    const xSpace = canvasDimensions.width / (maxX + IMPORT_TILE_MARGINS)
    const xEdge = (xSpace / 3.0) * 2.0
    const ySpace = canvasDimensions.height / (maxY + IMPORT_TILE_MARGINS)
    const yEdge = ySpace / Math.sqrt(3.0)
    const tileEdge = Math.min(xEdge, yEdge)
    this.setTileEdge(tileEdge)
  }

  getTileDimensions() {
    return this._tileSize
  }

  forEachTilePosition(iterator) {
    for (let x = -1; x < this._tileCounts.width + 2; x++) {
      for (let y = -1; y < this._tileCounts.height + 2; y++) {
        iterator(x, y)
      }
    }
  }

  /** Return X/Y center point of tile at given position */
  tileCenterPoint(position) {
    return {
      x: (position.x + TILE_OFFSET) * (0.75 * this._tileSize.width),
      y: ((position.y + TILE_OFFSET) * this._tileSize.height) + (
          position.x % 2 === 0 ?
            this._tileSize.height * 0.5 :
            0.0
          ),
    }
  }

  getUpperLeftPoint(center, style) {
    const tileScale = tileScaleFromStyle(style)
    return [
      center.x - (tileScale * this._tileSize.width * 0.25),
      center.y - (tileScale * this._tileSize.height * 0.5),
    ]
  }

  getUpperRightPoint(center, style) {
    const tileScale = tileScaleFromStyle(style)
    return [
      center.x + (tileScale * this._tileSize.width * 0.25),
      center.y - (tileScale * this._tileSize.height * 0.5),
    ]
  }

  getRightPoint(center, style) {
    const tileScale = tileScaleFromStyle(style)
    return [
      center.x + (tileScale * this._tileSize.width * 0.5),
      center.y,
    ]
  }

  getLowerRightPoint(center, style) {
    const tileScale = tileScaleFromStyle(style)
    return [
      center.x + (tileScale * this._tileSize.width * 0.25),
      center.y + (tileScale * this._tileSize.height * 0.5),
    ]
  }

  getLowerLeftPoint(center, style) {
    const tileScale = tileScaleFromStyle(style)
    return [
      center.x - (tileScale * this._tileSize.width * 0.25),
      center.y + (tileScale * this._tileSize.height * 0.5),
    ]
  }

  getLeftPoint(center, style) {
    const tileScale = tileScaleFromStyle(style)
    return [
      center.x - (tileScale * this._tileSize.width * 0.5),
      center.y,
    ]
  }

  rectToHexPosition(rectX, rectY) {
    const x =
      Math.round(rectX / ((this._tileSize.width * 0.75) / devicePixelRatio)) -
      TILE_OFFSET
    const y = Math.round(
      (rectY / (this._tileSize.height / devicePixelRatio)) -
      (x % 2 === 0 ? 0.5 : 0)
    ) - TILE_OFFSET
    return {x, y}
  }

  hexAreaToSide(area) {
    return Math.sqrt(
      (area * 2) / (Math.sqrt(3) * 3)
    )
  }
}

export default new HexagonGrid()
