/**
 * HexagonGrid: manage and convert hexagon coordinates
 *
 * Primary reference:
 * http://www.redblobgames.com/grids/hexagons/#coordinates
 */

import {settings, tileEdgeRange, canvasDimensions} from './constants'

const TILE_OFFSET = 1

class HexagonGrid {
  constructor() {
    this._setTileEdge(tileEdgeRange.default)
  }

  _setTileEdge(tileEdge) {
    this._tileSize = {
      width: 2.0 * tileEdge,
      height: Math.sqrt(3.0) * tileEdge,
    }
    this._tileCounts = {
      width: Math.floor(
        canvasDimensions.width / (this._tileSize.width * 0.75) - TILE_OFFSET * 2
      ),
      height: Math.floor(
        canvasDimensions.height / this._tileSize.height - TILE_OFFSET * 2
      ),
    }
  }

  getTileDimensions() {
    return this._tileSize
  }

  forEachTilePosition(iterator) {
    for (let x = TILE_OFFSET; x < this._tileCounts.width; x++) {
      for (let y = TILE_OFFSET; y < this._tileCounts.height; y++) {
        iterator(x, y)
      }
    }
  }

  /** Return X/Y center point of tile at given position */
  tileCenterPoint(position) {
    return {
      x: (position.x + TILE_OFFSET) * (0.75 * this._tileSize.width),
      y: (position.y + TILE_OFFSET) * this._tileSize.height + (
          position.x % 2 == 0 ?
            this._tileSize.height * 0.5 :
            0.0
          ),
    }
  }

  getUpperLeftPoint(center, contiguous) {
    const tileScale = contiguous ? 1.0 : settings.tileScale
    return [
      center.x - tileScale * this._tileSize.width * 0.25,
      center.y - tileScale * this._tileSize.height * 0.5
    ]
  }

  getUpperRightPoint(center, contiguous) {
    const tileScale = contiguous ? 1.0 : settings.tileScale
    return [
      center.x + tileScale * this._tileSize.width * 0.25,
      center.y - tileScale * this._tileSize.height * 0.5
    ]
  }

  getRightPoint(center, contiguous) {
    const tileScale = contiguous ? 1.0 : settings.tileScale
    return [
      center.x + tileScale * this._tileSize.width * 0.5,
      center.y
    ]
  }

  getLowerRightPoint(center, contiguous) {
    const tileScale = contiguous ? 1.0 : settings.tileScale
    return [
      center.x + tileScale * this._tileSize.width * 0.25,
      center.y + tileScale * this._tileSize.height * 0.5
    ]
  }

  getLowerLeftPoint(center, contiguous) {
    const tileScale = contiguous ? 1.0 : settings.tileScale
    return [
      center.x - tileScale * this._tileSize.width * 0.25,
      center.y + tileScale * this._tileSize.height * 0.5
    ]
  }

  getLeftPoint(center, contiguous) {
    const tileScale = contiguous ? 1.0 : settings.tileScale
    return [
      center.x - tileScale * this._tileSize.width * 0.5,
      center.y
    ]
  }

  rectToHexPosition(rectX, rectY) {
    const x =
      Math.round(rectX / (this._tileSize.width * 0.75 * 0.5)) -
      TILE_OFFSET
    const y = Math.round(
      rectY / (this._tileSize.height * 0.5) -
      (x % 2 == 0 ? 0.5 : 0)
    ) - TILE_OFFSET
    return {x, y}
  }
}

export default new HexagonGrid()
