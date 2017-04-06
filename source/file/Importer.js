/**
 * Importer: convert hex grid TopoJSON into hexagon grid coordinates
 *
 * Assume that TopoJSON is of a hex grid and use some fuzzy logic to re-generate
 * that grid in the offset coordinates that GridGeometry uses.
 */

import {
  default as gridGeometry,
  IMPORT_TILE_MARGINS,
} from '../geometry/GridGeometry'
import {OBJECT_ID} from './Exporter'

const LEFT_BIAS = 2
// epsilon for measuring equality of transformed coords
const ERROR_MARGIN = 1e-12

class Importer {
  /** Convert tilegram TopoJSON to grid coordinates */
  fromTopoJson(topoJson) {
    const geometries = topoJson.objects[OBJECT_ID].geometries
    const tilePoints = []
    const datasetMap = {}
    geometries.forEach(geometry => {
      datasetMap[geometry.id] = geometry.properties.tilegramValue
      if (geometry.type == null) { return }
      const paths = this._getAbsolutePaths(
        geometry,
        topoJson.arcs,
        topoJson.transform
      )
      paths.forEach(path => {
        tilePoints.push({
          id: geometry.id,
          point: this._hexagonCenterPoint(path),
          tilegramValue: geometry.properties.tilegramValue,
        })
      })
    })
    const tiles = this._getTilePositions(
      tilePoints,
      topoJson.properties.tilegramTileSize
    )
    const dataset = {data: Object.keys(datasetMap).map((row) => [row, datasetMap[row]])}
    return {
      tiles: this._normalizeTilePosition(tiles),
      dataset,
      metricPerTile: topoJson.properties.tilegramMetricPerTile,
      geography: topoJson.properties.tilegramGeography || 'United States',
    }
  }

  /** Determine paths' absolute points, given TopoJSON delta-encoded arcs */
  _getAbsolutePaths(geometry, allArcs, transform) {
    // flatten MultiPolygon array so that we can map the arcs to get absolute paths
    const arcs = geometry.type === 'Polygon' ?
      geometry.arcs : geometry.arcs.reduce((a, b) => a.concat(b))
    // for each arc
    return arcs.map(arc => {
      return arc.reduce(
        (geometryPoints, arcIndex) => {
          const reverse = arcIndex < 0
          const normalArcIndex = !reverse ?
          arcIndex :
          -arcIndex - 1
          const deltaEncodedPoints = allArcs[normalArcIndex].slice()
          const arcPoints = []

          // for each delta-encoded point in arc
          deltaEncodedPoints.forEach(delta => {
            const transformedDelta = [
              delta[0] * (transform ? transform.scale[0] : 1.0),
              delta[1] * (transform ? transform.scale[1] : 1.0),
            ]
            if (arcPoints.length > 0) {
              // apply delta to last absolute value, then add it
              const lastPoint = arcPoints[arcPoints.length - 1]
              const newPoint = [
                lastPoint[0] + transformedDelta[0],
                lastPoint[1] + transformedDelta[1],
              ]
              arcPoints.push(newPoint)
            } else {
              // first point of delta-encoded arc is absolute, so add it
              arcPoints.push(transformedDelta)
            }
          })

          // reverse arc if specified in index
          if (reverse) {
            arcPoints.reverse()
          }

          // drop first point of arc if it's the same as last point of last arc
          if (geometryPoints.length > 0) {
            const lastGeometryPoint = geometryPoints[geometryPoints.length - 1]
            const firstArcPoint = arcPoints[0]
            if (
              Math.abs(firstArcPoint[0] - lastGeometryPoint[0]) < ERROR_MARGIN &&
              Math.abs(firstArcPoint[1] - lastGeometryPoint[1]) < ERROR_MARGIN
            ) {
              arcPoints.shift()
            }
          }

          return geometryPoints.concat(arcPoints)
        },
        []
      )
    })
  }

  /** translate X/Y coordinates into hexagon coordinates */
  _getTilePositions(tilePoints, tileSize) {
    let xDelta
    let yDelta
    if (tileSize) {
      // v1.1+ tilegram
      xDelta = tileSize.width
      yDelta = tileSize.height * 0.75
    } else {
      // pre-v1.1 tilegram
      [xDelta, yDelta] = this._getProbableDeltas(tilePoints)
      xDelta *= 2.0
    }

    let origin
    let position
    return tilePoints.map(tilePoint => {
      [position, origin] = this._getTilePosition(
        tilePoint.point,
        origin,
        xDelta,
        yDelta
      )
      return {
        id: tilePoint.id,
        position,
        tilegramValue: tilePoint.tilegramValue,
      }
    })
  }

  /** Offset all tiles so that there are no negative coordinates */
  _normalizeTilePosition(tiles) {
    const tileYs = tiles.map(tile => tile.position.y)
    const maxY = Math.max(...tileYs)
    const minX = Math.min(...tiles.map(tile => tile.position.x))
    return tiles.map(tile => {
      return {
        id: tile.id,
        position: {
          x: (tile.position.x - minX) + (IMPORT_TILE_MARGINS - LEFT_BIAS),
          y: ((maxY - tile.position.y) - (1 - (maxY % 2))) + IMPORT_TILE_MARGINS,
        },
        tilegramValue: tile.tilegramValue,
      }
    })
  }

  /** Determine hexagon coordinate of point relative to origin, given deltas */
  _getTilePosition(point, origin, xDelta, yDelta) {
    const position = {x: 0, y: 0}
    if (!origin) {
      origin = point
    } else {
      position.y = Math.round(
        ((point.y - origin.y) / yDelta) -
        gridGeometry.getDrawOffsetY()
      )
      position.x = Math.floor(
        ((point.x - origin.x) / xDelta) +
        gridGeometry.getDrawOffsetX(position.y)
      )
    }
    return [position, origin]
  }

  /**
   * DEPRECATED: for pre-v1.1.0 only
   * Determine probable X and Y deltas from tile points by tallying
   */
  _getProbableDeltas(tilePoints) {
    const SAMPLE_COUNT = 100
    const DIMENSIONS = ['x', 'y']

    return DIMENSIONS.map(dimension => {
      const deltaCounts = []

      // tally frequency of each delta over sample
      for (let i = 0; i < Math.min(SAMPLE_COUNT, tilePoints.length - 1); i++) {
        const delta = Math.abs(
          tilePoints[i + 1].point[dimension] -
          tilePoints[i].point[dimension]
        )
        if (delta > 0.0) {
          const deltaCount = deltaCounts.find(
            testDeltaCount => testDeltaCount.value === delta
          )
          if (deltaCount) {
            deltaCount.deltaCount++
          } else {
            deltaCounts.push({
              value: delta,
              deltaCount: 1,
            })
          }
        }
      }
      deltaCounts.sort((a, b) => a.deltaCount - b.deltaCount)
      return deltaCounts.pop().value
    })
  }

  /** Determine the X/Y center point of a given hexagon by averaging */
  _hexagonCenterPoint(inputPath) {
    function hexagonDimensionCenter(path, subIndex) {
      return path.slice(0, 6).reduce(
        (sum, p) => sum + p[subIndex],
        0
      ) / 6.0
    }
    return {
      x: hexagonDimensionCenter(inputPath, 0),
      y: hexagonDimensionCenter(inputPath, 1),
    }
  }
}

export default new Importer()
