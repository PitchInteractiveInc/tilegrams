/**
 * Exporter: output TopoJSON from hexagon grid
 *
 * Primary reference:
 * https://github.com/mbostock/topojson/wiki/Introduction
 */

import hexagonGrid from '../HexagonGrid'

export const OBJECT_ID = 'tiles'

class Exporter {
  /** Convert hexagon offset coordinates to TopoJSON */
  fromTiles(tiles) {
    const geometries = []
    const arcs = []

    const maxTileY = tiles.reduce(
      (max, tile) => Math.max(max, tile.position.y),
      -Infinity
    )

    tiles.sort((a, b) => {
      return (
        (a.position.y + (a.position.x * (maxTileY + 1))) -
        (b.position.y + (b.position.x * (maxTileY + 1)))
      )
    })

    tiles.forEach((tile, tileIndex) => {
      geometries.push({
        type: 'Polygon',
        id: tile.id,
        arcs: [[tileIndex]],
      })
      const center = hexagonGrid.tileCenterPoint({
        x: tile.position.x,
        y: (maxTileY - tile.position.y) + ((tile.position.x % 2 === 0) ? 0 : 1),
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
        [OBJECT_ID]: {
          type: 'GeometryCollection',
          geometries,
        },
      },
      arcs,
    }
  }

  /** Format TopoJSON from GeoJSON */
  fromGeoJSON(geoJSON) {
    const arcs = []
    const topoJson = {
      type: 'Topology',
      transform: {
        scale: [1.0, 1.0],
        translate: [0.0, 0.0],
      },
      objects: {
        states: {
          type: 'GeometryCollection',
          geometries: geoJSON.features.map(feature => {
            const geometryArcIndices = []
            const hasMultiplePaths = feature.geometry.coordinates.length > 1
            feature.geometry.coordinates.forEach(path => {
              const points = hasMultiplePaths ? path[0] : path
              const arc = []
              points.forEach((point, pointIndex) => {
                if (pointIndex === 0) {
                  arc.push(point)
                } else {
                  arc.push([
                    points[pointIndex][0] - points[pointIndex - 1][0],
                    points[pointIndex][1] - points[pointIndex - 1][1],
                  ])
                }
              })
              arcs.push(arc)
              geometryArcIndices.push(arcs.length - 1)
            })
            return {
              type: hasMultiplePaths ? 'MultiPolygon' : 'Polygon',
              id: feature.id,
              arcs: hasMultiplePaths ?
                geometryArcIndices.map(index => [[index]]) :
                [geometryArcIndices],
            }
          }),
        },
      },
    }
    topoJson.arcs = arcs
    return topoJson
  }
}

export default new Exporter()
