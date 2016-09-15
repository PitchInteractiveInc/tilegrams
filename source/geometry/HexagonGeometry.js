/**
 * HexagonGeometry: manage and convert hexagon coordinates
 *
 * Primary reference:
 * http://www.redblobgames.com/grids/hexagons/#coordinates
 */

import {settings, tileEdgeRange, canvasDimensions} from '../constants'
import PointyTopHexagonShape from './PointyTopHexagonShape'

const TILE_OFFSET = 1

// tile margins must be even to not break Importer._getTilePosition()
export const IMPORT_TILE_MARGINS = 10

const shape = new PointyTopHexagonShape()

class HexagonGeometry {
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
    this._tileSize = shape.getTileSize(this._tileEdge)
    const gridUnit = shape.getGridUnit()
    this._tileCounts = {
      width: Math.floor(
        (canvasDimensions.width / (this._tileSize.width * gridUnit.width)) -
        (TILE_OFFSET * 2)
      ),
      height: Math.floor(
        (canvasDimensions.height / (this._tileSize.height * gridUnit.height)) -
        (TILE_OFFSET * 2)
      ),
    }
  }

  setTileEdgeFromMax(maxX, maxY) {
    const tileEdge = shape.getTileEdgeFromGridUnit({
      width: canvasDimensions.width / (maxX + IMPORT_TILE_MARGINS),
      height: canvasDimensions.height / (maxY + IMPORT_TILE_MARGINS),
    })
    this.setTileEdge(tileEdge)
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
    const gridUnit = shape.getGridUnit()
    return {
      x: this._tileSize.width * (
        ((position.x + TILE_OFFSET) * gridUnit.width) +
        shape.getGridOffsetX(position.y)
      ),
      y: this._tileSize.height * (
        ((position.y + TILE_OFFSET) * gridUnit.height) +
        shape.getGridOffsetY(position.x)
      ),
    }
  }

  getPointsAround(center, contiguous) {
    const tileScale = contiguous ? 1.0 : settings.tileScale
    const scaledSize = {
      width: this._tileSize.width * tileScale,
      height: this._tileSize.height * tileScale,
    }
    return shape.getPointsAround(center, scaledSize)
  }

  /**
   * Return grid position, given screen coordinates
   * NOTE: The order that X and Y can be calculated depends on the shape
   * because of grid offsets.
   */
  rectToHexPosition(rectX, rectY) {
    const gridUnit = shape.getGridUnit()
    const y =
      Math.round(
        (rectY / ((this._tileSize.height * gridUnit.height) / devicePixelRatio))
        - shape.getGridOffsetY()
      ) - TILE_OFFSET
    const x =
      Math.round(
        (rectX / ((this._tileSize.width * gridUnit.width) / devicePixelRatio))
        - shape.getGridOffsetX(y)
      ) - TILE_OFFSET
    return {x, y}
  }

  hexAreaToSide(area) {
    return shape.getTileEdgeFromArea(area)
  }
}

export default new HexagonGeometry()
