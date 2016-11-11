import {geoPath, geoAlbersUsa} from 'd3-geo'
import inside from 'point-in-polygon';
import area from 'area-polygon'
import topogramImport from 'topogram'

import Graphic from './Graphic'
import mapResource from '../resources/USMapResource'
import exporter from '../file/Exporter'
import {fipsColor, updateBounds, checkWithinBounds} from '../utils'
import {canvasDimensions} from '../constants'

const topogram = topogramImport()

const MIN_PATH_AREA = 0.5
const MAX_ITERATION_COUNT = 15

export default class MapGraphic extends Graphic {
  constructor() {
    super()

    this._stateFeatures = null
    this._iterationCount = 0
    this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
    this.getFeatureAtPoint = this.getFeatureAtPoint.bind(this)
    topogram.iterations(1)
  }

  /** Apply topogram on topoJson using data in properties */
  computeCartogram(properties) {
    topogram.value(
      feature => properties.find(property => property[0] === feature.id)[1]
    )
    this._iterationCount = 0

    // compute initial cartogram
    this.updatePreProjection()

    // generate basemap for topogram
    const baseMap = this._getbaseMapTopoJson(properties)
    this._stateFeatures = topogram(
      baseMap.topo,
      baseMap.geometries
    )
    this._precomputeBounds()
  }

  /**
   * Returns either the original map topojson and geometries or
   * a filtered version of the map if the data properties don't match the map.
   */
  _getbaseMapTopoJson(properties) {
    const baseMapTopoJson = mapResource.getTopoJson()
    let filteredTopoJson = null
    let filteredGeometries = null

    const baseMapLength = baseMapTopoJson.objects[mapResource.getObjectId()].geometries.length
    // for custom uploads with incomplete data
    if (properties.length !== baseMapLength) {
      const statesWithData = properties.map(property => property[0])
      filteredGeometries = baseMapTopoJson.objects[mapResource.getObjectId()].geometries
        .filter(geom => statesWithData.indexOf(geom.id) > -1)
      filteredTopoJson = JSON.parse(JSON.stringify(baseMapTopoJson)) // clones the baseMap
      // only pass filtered geometries to topogram generator
      filteredTopoJson.objects[mapResource.getObjectId()].geometries = filteredGeometries
    }

    return {
      topo: filteredTopoJson || baseMapTopoJson,
      geometries: filteredGeometries || mapResource.getGeometries(),
    }
  }

  /**
   * Calculate subsequent cartogram iterations.
   * Return true if iteration was performed, false if not.
   */
  iterateCartogram() {
    if (this._iterationCount > MAX_ITERATION_COUNT) {
      return false
    }
    topogram.projection(x => x)
    const topoJson = exporter.fromGeoJSON(this._stateFeatures)
    this._stateFeatures = topogram(topoJson, topoJson.objects.states.geometries)
    this._precomputeBounds()
    this._iterationCount++
    return true
  }

  resetBounds() {
    this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
  }

  /** Apply projectiong _before_ cartogram computation */
  updatePreProjection() {
    const projection = geoAlbersUsa()
      .scale(canvasDimensions.width)
      .translate([
        canvasDimensions.width * 0.5,
        canvasDimensions.height * 0.5,
      ])
    topogram.projection(projection)
  }

  /** Pre-compute projected bounding boxes; filter out small-area paths */
  _precomputeBounds() {
    const pathProjection = geoPath()
    this._generalBounds = [[Infinity, Infinity], [-Infinity, -Infinity]]
    this._projectedStates = this._stateFeatures.features.map(feature => {
      const hasMultiplePaths = feature.geometry.type === 'MultiPolygon'
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
      if (!checkWithinBounds(pointDimensions, bounds || this._generalBounds)) {
        return false
      }
      const matchingPath = this._projectedStates[featureIndex].paths.find(
        path => inside(pointDimensions, path[0])
      )
      return matchingPath != null
    })
  }

  computeCartogramArea() {
    const featureAreas = this._stateFeatures.features.map((feature) => {
      return geoPath().area(feature)
    })
    return featureAreas.reduce((a, b) => a + b)
  }
}
