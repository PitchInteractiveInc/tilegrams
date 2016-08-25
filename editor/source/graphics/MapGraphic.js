import {geoPath, geoAlbersUsa} from 'd3-geo'
import topojson from 'topojson'
import inside from 'point-in-polygon';

import {fipsColor} from '../utils'
import Graphic from './Graphic'

export default class Map extends Graphic {
  constructor(topoJson) {
    super()
    this._stateFeatures = topojson.feature(
      topoJson,
      topoJson.objects.states
    )
    this._projection = geoAlbersUsa()
      .scale(3500.0)
      .translate([2000.0, 1000.0])
  }

  render(ctx) {
    return
    const drawFeaturePathToContext = geoPath()
      .projection(this._projection)
      .context(ctx)

    this._stateFeatures.features.forEach(feature => {
      ctx.beginPath()
      drawFeaturePathToContext(feature)
      ctx.closePath()
      ctx.fillStyle = fipsColor(feature.id)
      ctx.globalAlpha = 0.5
      ctx.fill()
      ctx.globalAlpha = 1.0
    })
  }

  /** Find feature that contains given point */
  getFeatureAtPoint(point) {
    const projectedPoint = this._projection.invert([point.x, point.y])
    return this._stateFeatures.features.find(feature => {
      // TODO: check feature bounding box before looking up point
      const matchingPath = feature.geometry.coordinates.find(path => {
        return inside(projectedPoint, path[0])
      })
      return matchingPath != null
    })
  }
}
