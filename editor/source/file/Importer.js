/**
 * Importer: convert hex grid TopoJSON into hexagon grid coordinates
 *
 * Assume that TopoJSON is of a hex grid and use some fuzzy logic to re-generate
 * that grid in the offset coordinates that HexagonGrid uses.
 */

import mapData from '../MapData'

class Importer {
  /** Convert hex grid TopoJSON to hexagon offset coordinates */
  fromTopoJson(topoJson) {
    const geometries = topoJson.objects[mapData.getObjectId()].geometries
    const tilePoints = geometries.map(geometry => {
      const path = this._getAbsolutePath(geometry, topoJson.arcs)
      return {
        id: geometry.id,
        point: this._hexagonCenterPoint(path)
      }
    })
    return this._getTilePositions(tilePoints)
  }

  /** Determine path absolute points, given TopoJSON delta-encoded arcs */
  _getAbsolutePath(geometry, allArcs) {
    // for each arc
    return geometry.arcs[0].reduce(
      (geometryPoints, arcIndex) => {
        const reverse = arcIndex < 0
        const normalArcIndex = !reverse ?
          arcIndex :
          -arcIndex - 1
        const deltaEncodedPoints = allArcs[normalArcIndex].slice()
        const arcPoints = []

        // for each delta-encoded point in arc
        deltaEncodedPoints.forEach(delta => {
          if (arcPoints.length > 0) {
            // apply delta to last absolute value, then add it
            const lastPoint = arcPoints[arcPoints.length - 1]
            const newPoint = [
              lastPoint[0] + delta[0],
              lastPoint[1] + delta[1]
            ]
            arcPoints.push(newPoint)
          } else {
            // first point of delta-encoded arc is absolute, so add it
            arcPoints.push(delta)
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
            firstArcPoint[0] == lastGeometryPoint[0] &&
            firstArcPoint[1] == lastGeometryPoint[1]
          ) {
            arcPoints.shift()
          }
        }

        return geometryPoints.concat(arcPoints)
      },
      []
    )
  }

  _getTilePositions(tilePoints) {
    const [xDelta, yDelta] = this._getProbableDeltas(tilePoints)

    // translate X/Y coordinates into hexagon coordinates
    let origin
    let position
    const tiles = tilePoints.map(tilePoint => {
      [position, origin] = this._getTilePosition(
        tilePoint.point,
        origin,
        xDelta,
        yDelta
      )
      return {
        id: tilePoint.id,
        position,
      }
    })

    // Offset all tiles so that there are no negative coordinates
    const tileYs = tiles.map(tile => tile.position.y)
    const minY = Math.min.apply(null, tileYs)
    const maxY = Math.max.apply(null, tileYs)
    const minX = Math.min.apply(null, tiles.map(tile => tile.position.x))
    return tiles.map(tile => {
      return {
        id: tile.id,
        position: {
          x: tile.position.x + minX,
          y: (maxY - minY) - (tile.position.y - minY),
        }
      }
    })
  }

  /** Determine hexagon coordinate of point relative to origin, given deltas */
  _getTilePosition(point, origin, xDelta, yDelta) {
    const position = {x: 0, y: 0}
    if (!origin) {
      origin = point
    } else {
      position.x = Math.round((point.x - origin.x) / xDelta)
      position.y = ((point.y - origin.y) / yDelta)
      if (position.x % 2 == 0) {
        position.y = Math.ceil(position.y)
      } else {
        position.y = Math.floor(position.y)
      }
    }
    return [position, origin]
  }

  /** Determine probable X and Y deltas from tile points by tallying */
  _getProbableDeltas(tilePoints) {
    const SAMPLE_COUNT = 100
    const DIMENSIONS = ['x', 'y']

    return DIMENSIONS.map(dimension => {
      let deltaCounts = []

      // tally frequency of each delta over sample
      for (var i = 0; i < Math.min(SAMPLE_COUNT, tilePoints.length); i++) {
        const delta =
          tilePoints[i + 1].point[dimension] -
          tilePoints[i].point[dimension]
        if (delta > 0.0) {
          const deltaCount = deltaCounts.find(
            deltaCount => deltaCount.value == delta
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

      // return delta that occurred the most often
      const maxDeltaCount = deltaCounts.reduce(
        (maxDeltaCount, deltaCount) => {
          if (!maxDeltaCount || deltaCount.count > maxDeltaCount.count) {
            return deltaCount
          } else {
            return maxDeltaCount
          }
        },
        null
      )

      return maxDeltaCount.value
    })
  }

  /** Determine the X/Y center point of a given hexagon by averaging */
  _hexagonCenterPoint(path) {
    function hexagonDimensionCenter(path, subIndex) {
      return path.slice(0, 6).reduce(
        (sum, p) => sum + p[subIndex],
        0
      ) / 6.0
    }
    return {
      x: hexagonDimensionCenter(path, 0),
      y: hexagonDimensionCenter(path, 1),
    }
  }
}

export default new Importer()
