/**
 * Exporter: output TopoJSON from hexagon grid
 *
 * Primary reference:
 * https://github.com/mbostock/topojson/wiki/Introduction
 */

import canvas from '../Canvas'
import mapData from '../MapData'
import hexagonGrid from '../HexagonGrid'

class Exporter {
  /** Convert hexagon offset coordinates to TopoJSON */
  formatTopoJson(tiles) {
    const geometries = []
    const arcs = []

    const maxTileY = tiles.reduce(
      (max, tile) => Math.max(max, tile.position.y),
      -Infinity
    )

    tiles.forEach((tile, tileIndex) => {
      geometries.push({
        type: 'Polygon',
        id: tile.id,
        arcs: [[tileIndex]]
      })
      const center = hexagonGrid.tileCenterPoint({
        x: tile.position.x,
        y: maxTileY - tile.position.y + ((tile.position.x % 2 == 0) ? 0 : 1),
      })
      arcs.push([
        hexagonGrid.getLeftPoint(center, true),
        hexagonGrid.getUpperLeftPoint(center, true),
        hexagonGrid.getUpperRightPoint(center, true),
        hexagonGrid.getRightPoint(center, true),
        hexagonGrid.getLowerRightPoint(center, true),
        hexagonGrid.getLowerLeftPoint(center, true),
        hexagonGrid.getLeftPoint(center, true),
      ])
    })

    return {
      type: 'Topology',
      objects: {
        [mapData.getObjectId()]: {
          type: 'GeometryCollection',
          geometries,
        }
      },
      arcs,
    }
  }
}

export default new Exporter()
