/** Hexagon grid: manage and convert hexagon coordinates */

import {settings, tileEdgeSetting, canvasDimensions} from './constants'

const TILE_OFFSET = 1

class HexagonGrid {
  constructor() {
    this._setTileEdge(tileEdgeSetting.initialValue)
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

  getUpperLeftPoint(center) {
    return [
      center.x - settings.tileScale * this._tileSize.width * 0.25,
      center.y - settings.tileScale * this._tileSize.height * 0.5
    ]
  }

  getUpperRightPoint(center) {
    return [
      center.x + settings.tileScale * this._tileSize.width * 0.25,
      center.y - settings.tileScale * this._tileSize.height * 0.5
    ]
  }

  getRightPoint(center) {
    return [
      center.x + settings.tileScale * this._tileSize.width * 0.5,
      center.y
    ]
  }

  getLowerRightPoint(center) {
    return [
      center.x + settings.tileScale * this._tileSize.width * 0.25,
      center.y + settings.tileScale * this._tileSize.height * 0.5
    ]
  }

  getLowerLeftPoint(center) {
    return [
      center.x - settings.tileScale * this._tileSize.width * 0.25,
      center.y + settings.tileScale * this._tileSize.height * 0.5
    ]
  }

  getLeftPoint(center) {
    return [
      center.x - settings.tileScale * this._tileSize.width * 0.5,
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
