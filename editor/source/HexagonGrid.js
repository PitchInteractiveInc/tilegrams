/** Hexagon grid: manage and convert hexagon coordinates */

const SIDE = 30
const TILE_DIMENSIONS = {
  width: 2.0 * SIDE,
  height: Math.sqrt(3.0) * SIDE,
}
const TILE_OFFSET = 2

const TILES_WIDE = 250
const TILES_HIGH = 119

class HexagonGrid {
  getTileDimensions() {
    return TILE_DIMENSIONS
  }

  forEachTilePosition(iterator) {
    for (let x = TILE_OFFSET; x < TILES_WIDE; x++) {
      for (let y = TILE_OFFSET; y < TILES_HIGH; y++) {
        iterator(x, y)
      }
    }
  }

  /** Return X/Y center point of tile at given position */
  tileCenterPoint(position) {
    return {
      x: (position.x + TILE_OFFSET) * (1.5 * SIDE),
      y: (position.y + TILE_OFFSET) * TILE_DIMENSIONS.height + (
          position.x % 2 == 0 ?
            TILE_DIMENSIONS.height * 0.5 :
            0.0
          ),
    }
  }

  rectToHexPosition(rectX, rectY) {
    const x = Math.round(rectX / (TILE_DIMENSIONS.width * 0.75 * 0.5)) - TILE_OFFSET
    const y = Math.round(
      rectY / (TILE_DIMENSIONS.height * 0.5) -
      (x % 2 == 0 ? 0.5 : 0)
    ) - TILE_OFFSET
    return {x, y}
  }
}

export default new HexagonGrid()
