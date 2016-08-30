/**
 * Exporter: output TopoJSON from hexagon grid
 *
 * Primary reference:
 * https://github.com/mbostock/topojson/wiki/Introduction
 */

import canvas from './Canvas'
import hexagonGrid from './HexagonGrid'
import {onExportTopoJson} from './constants'
import {startDownload} from './utils'

class Exporter {
  constructor() {
    onExportTopoJson(() => this.toTopoJson())
  }

  toTopoJson() {
    const json = this._formatTopoJson(canvas.getTiles())
    startDownload({
      filename: 'hexagon-cartogram.json',
      mimeType: 'application/json',
      content: JSON.stringify(json),
    })
  }

  /** Convert hexagon offset coordinates to TopoJSON */
  _formatTopoJson(tiles) {
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
        hexagonGrid.getLeftPoint(center),
        hexagonGrid.getUpperLeftPoint(center),
        hexagonGrid.getUpperRightPoint(center),
        hexagonGrid.getRightPoint(center),
        hexagonGrid.getLowerRightPoint(center),
        hexagonGrid.getLowerLeftPoint(center),
        hexagonGrid.getLeftPoint(center),
      ])
    })

    return {
      type: 'Topology',
      objects: {
        states: {
          type: 'GeometryCollection',
          geometries,
        }
      },
      arcs,
    }
  }
}

export default new Exporter()
