import {geoPath, geoAlbersUsa} from 'd3-geo'
import topojson from 'topojson'
import inside from 'point-in-polygon';
import area from 'area-polygon'

import Graphic from './Graphic'
import {fipsColor, updateBounds, checkWithinBounds} from '../utils'
import {canvasDimensions} from '../constants'

const MIN_PATH_AREA = 0.5

export default class Map extends Graphic {
  constructor(mapTopoJson) {
    super()
    this._initProjection()
    this._importTopoJson(mapTopoJson)
  }

  _importTopoJson(mapTopoJson) {
    // break out state features
    this._stateFeatures = topojson.feature(
      mapTopoJson,
      mapTopoJson.objects.states
    )

    // pre-cache projected bounding boxes and paths for each state
    const pathProjection = geoPath().projection(this._project)
    this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
    this._projectedStates = this._stateFeatures.features.map(feature => {
      const hasMultiplePaths = feature.geometry.type == 'MultiPolygon'
      const bounds = pathProjection.bounds(feature)
      updateBounds(this._generalBounds, bounds)
      const paths = feature.geometry.coordinates
        .filter(path => area(hasMultiplePaths ? path[0] : path) > MIN_PATH_AREA)
        .map(path => [(hasMultiplePaths ? path[0] : path).map(this._project)])
      return {bounds, paths}
    })
  }

  render(ctx) {
    const drawFeaturePathToContext = geoPath()
      .projection(this._project)
      .context(ctx)

    this._stateFeatures.features.forEach(feature => {
      ctx.beginPath()
      drawFeaturePathToContext(feature)
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

  _initProjection() {
    this._project = geoAlbersUsa()
      .scale(canvasDimensions.width)
      .translate([
        canvasDimensions.width * 0.5,
        canvasDimensions.height * 0.5,
      ])
  }
}
