/**
 * GridGeometry: manage and convert grid coordinates
 */

import {settings, tileEdgeRange, canvasDimensions} from '../constants'
import PointyTopHexagonShape from './shapes/PointyTopHexagonShape'

const TILE_OFFSET = 1

// tile margins must be even to not break Importer._getTilePosition()
export const IMPORT_TILE_MARGINS = 6

const shape = new PointyTopHexagonShape()

class GridGeometry {
  constructor() {
    this.setTileEdge(tileEdgeRange.default)
  }

  setTileEdge(tileEdge) {
    this._tileEdge = tileEdge
    this.resize()
  }

  setTileEdgeFromMax(maxX, maxY) {
    const tileEdge = shape.getTileEdgeFromGridUnit({
      width: canvasDimensions.width / (maxX + IMPORT_TILE_MARGINS),
      height: canvasDimensions.height / (maxY + IMPORT_TILE_MARGINS),
    })
    this.setTileEdge(tileEdge)
  }

  setTileEdgeFromArea(area) {
    const tileEdge = shape.getTileEdgeFromArea(area)
    this.setTileEdge(tileEdge)
  }

  getTileEdge() {
    return this._tileEdge
  }

  getTileDimensions() {
    return this._tileSize
  }

  getUnitOffsetX(y) {
    return shape.getUnitOffsetX(y)
  }

  getUnitOffsetY(x) {
    return shape.getUnitOffsetY(x)
  }

  getDrawOffsetX(y) {
    return shape.getDrawOffsetX(y)
  }

  getDrawOffsetY(x) {
    return shape.getDrawOffsetY(x)
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
        this.getDrawOffsetX(position.y)
      ),
      y: this._tileSize.height * (
        ((position.y + TILE_OFFSET) * gridUnit.height) +
        this.getDrawOffsetY(position.x)
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
   * Return grid position, given screen coordinates.
   * NOTE: The order that X and Y can be calculated depends on the shape
   * because of grid offsets.
   */
  getPositionFromScreen(screenX, screenY) {
    const gridUnit = shape.getGridUnit()
    const y =
      Math.round(
        (
          screenY /
          ((this._tileSize.height * gridUnit.height) / devicePixelRatio)
        ) - this.getDrawOffsetY()
      ) - TILE_OFFSET
    const x =
      Math.round(
        (
          screenX /
          ((this._tileSize.width * gridUnit.width) / devicePixelRatio)
        ) - this.getDrawOffsetX(y)
      ) - TILE_OFFSET
    return {x, y}
  }
}

export default new GridGeometry()
