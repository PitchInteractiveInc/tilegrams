import {geoPath, geoAlbersUsa} from 'd3-geo'
import inside from 'point-in-polygon';
import area from 'area-polygon'
import topogramImport from 'topogram'
const topogram = topogramImport()

import Graphic from './Graphic'
import {fipsColor, updateBounds, checkWithinBounds} from '../utils'
import {canvasDimensions} from '../constants'

const MIN_PATH_AREA = 0.5

export default class MapGraphic extends Graphic {
  /** Apply topogram on topoJson using data in properties */
  computeCartogram({topoJson, properties}) {
    topogram.value(
      feature => properties.find(property => property[0] == feature.id)[1]
    )
    topogram.projection(this._buildPreProjection())
    this._stateFeatures = topogram(
      topoJson,
      topoJson.objects.states.geometries
    )

    this._precomputeBounds()
  }

  /** Pre-compute projected bounding boxes; filter out small-area paths */
  _precomputeBounds() {
    const pathProjection = geoPath()
    this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
    this._projectedStates = this._stateFeatures.features.map(feature => {
      const hasMultiplePaths = feature.geometry.type == 'MultiPolygon'
      const bounds = pathProjection.bounds(feature)
      updateBounds(this._generalBounds, bounds)
      const paths = feature.geometry.coordinates
        .filter(path => area(hasMultiplePaths ? path[0] : path) > MIN_PATH_AREA)
        .map(path => [hasMultiplePaths ? path[0] : path])
      return {bounds, paths}
    })
  }

  render(ctx) {
    this._stateFeatures.features.forEach(feature => {
      ctx.beginPath()
      const hasMultiplePaths = feature.geometry.coordinates.length > 1
      feature.geometry.coordinates.forEach(path => {
        const points = hasMultiplePaths ? path[0] : path
        ctx.moveTo(points[0][0], points[0][1])
        for (let index = 1; index < points.length; index++) {
          ctx.lineTo(points[index][0], points[index][1])
        }
      })
      ctx.closePath()
      ctx.fillStyle = fipsColor(feature.id)
      ctx.globalAlpha = 0.35
      ctx.fill()
      ctx.globalAlpha = 1.0
    })
  }

  /** Find feature that contains given point */
  getFeatureAtPoint(point) {
    const pointDimensions = [point.x, point.y]

    // check if point is within general bounds of TopoJSON
    if (!checkWithinBounds(pointDimensions, this._generalBounds)) {
      return null
    }

    // for each feature: check if point is within bounds, then within path
    return this._stateFeatures.features.find((feature, featureIndex) => {
      const bounds = this._projectedStates[featureIndex].bounds
      if (!checkWithinBounds(pointDimensions, bounds)) {
        return false
      }
      const matchingPath = this._projectedStates[featureIndex].paths.find(
        path => inside(pointDimensions, path[0])
      )
      return matchingPath != null
    })
  }

  /** Build projection to apply _before_ cartogram computation */
  _buildPreProjection() {
    return geoAlbersUsa()
      .scale(canvasDimensions.width)
      .translate([
        canvasDimensions.width * 0.5,
        canvasDimensions.height * 0.5,
      ])
  }
}
