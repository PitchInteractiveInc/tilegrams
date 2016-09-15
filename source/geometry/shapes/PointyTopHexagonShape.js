/**
 * Primary geometry reference:
 * http://www.redblobgames.com/grids/hexagons/#coordinates
 */

export default class PointyTopHexagonShape {
  /** Return tile maximum dimensions, point-to-point, given edge */
  getTileSize(tileEdge) {
    return {
      width: Math.sqrt(3.0) * tileEdge,
      height: 2.0 * tileEdge,
    }
  }

  /** Determine edge length given unit */
  getTileEdgeFromGridUnit({width, height}) {
    return Math.min(
      width / Math.sqrt(3.0),
      (height / 3.0) * 2.0
    )
  }

  getTileEdgeFromArea(area) {
    return Math.sqrt(
      (area * 2) / (Math.sqrt(3) * 3)
    )
  }

  getGridUnit() {
    return {
      width: 1.0,
      height: 0.75,
    }
  }

  getGridOffsetX(y) {
    return y % 2 === 0 ? 0.5 : 0
  }

  getGridOffsetY() {
    return 0.0
  }

  getPointsAround(center, tileSize) {
    return [
      // upper left
      [
        center.x - (tileSize.width * 0.5),
        center.y - (tileSize.height * 0.25),
      ],
      // top
      [
        center.x,
        center.y - (tileSize.height * 0.5),
      ],
      // upper right
      [
        center.x + (tileSize.width * 0.5),
        center.y - (tileSize.height * 0.25),
      ],
      // lower right
      [
        center.x + (tileSize.width * 0.5),
        center.y + (tileSize.height * 0.25),
      ],
      // bottom
      [
        center.x,
        center.y + (tileSize.height * 0.5),
      ],
      // lower left
      [
        center.x - (tileSize.width * 0.5),
        center.y + (tileSize.height * 0.25),
      ],
    ]
  }
}
