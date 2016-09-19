import hull from 'hull.js'
import {DBSCAN} from 'density-clustering'
import polygonOverlap from 'polygon-overlap'

import Graphic from './Graphic'
import {fipsColor, fipsToPostal} from '../utils'
import gridGeometry from '../geometry/GridGeometry'
import {
  canvasDimensions,
  devicePixelRatio,
  selectedTileBorderColor,
  hoveredTileBorderColor,
} from '../constants'

export default class GridGraphic extends Graphic {
  constructor() {
    super()
    this.originalTilesLength = 0
    this._highlightId = null
    this._makingMarqueeSelection = false
    this._draggingMultiSelect = false
    this._selectedTiles = []
    this._highlightFromOutsideGrid = false
    this._mouseAt = {x: 0, y: 0}
    this._hasBeenEdited = false
    document.body.onkeydown = this.onkeydown.bind(this)
  }

  onMouseDown(event) {
    event.preventDefault()
    const position = gridGeometry.getPositionFromScreen(event.offsetX, event.offsetY)
    const tile = this._findTile(position)
    if (tile == null || this._selectedTiles.includes(tile)) {
      this._onMarqueeMouseDown(event)
    } else {
      this._onArrowMouseDown(event)
    }
  }

  _onArrowMouseDown(event) {
    if (this._tiles) {
      const position = gridGeometry.getPositionFromScreen(
        event.offsetX,
        event.offsetY
      )
      const tile = this._findTile(position)
      // Deselect if clicking on null tile, otherwise select tile and/or allow drag
      if (tile == null) {
        this._selectedTiles.length = 0
        return
      }
      if (this._selectedTiles[0] !== tile) {
        this._selectedTiles.length = 0
        this._draggingMultiSelect = true
        this._draggingMultiSelectOrigin = {
          x: event.offsetX,
          y: event.offsetY,
        }
        this._selectedTiles.push(tile)
      }
    }
  }

  _onMarqueeMouseDown(event) {
    if (this._tiles) {
      let createMarquee = true;
      // check if mouse on currently selected marquee tiles
      if (this._selectedTiles.length > 0) {
        const position = gridGeometry.getPositionFromScreen(event.offsetX, event.offsetY)
        const tile = this._findTile(position)
        if (this._selectedTiles.includes(tile)) {
          createMarquee = false
          this._draggingMultiSelect = true
          this._draggingMultiSelectOrigin = {
            x: event.offsetX,
            y: event.offsetY,
          }
        }
      }

      // else start a marquee
      if (createMarquee) {
        this._marqueeStart = this._mouseAt
        this._makingMarqueeSelection = true
      }
    }
  }

  _getMarqueeSelection() {
    const marqueeBounds = {
      x1: Math.min(this._marqueeStart.x * devicePixelRatio, this._mouseAt.x * devicePixelRatio),
      x2: Math.max(this._marqueeStart.x * devicePixelRatio, this._mouseAt.x * devicePixelRatio),
      y1: Math.min(this._marqueeStart.y * devicePixelRatio, this._mouseAt.y * devicePixelRatio),
      y2: Math.max(this._marqueeStart.y * devicePixelRatio, this._mouseAt.y * devicePixelRatio),
    }
    return this._tiles.filter((tile) => {
      const center = gridGeometry.tileCenterPoint(tile.position)
      return polygonOverlap(
        [
          [marqueeBounds.x1, marqueeBounds.y1],
          [marqueeBounds.x2, marqueeBounds.y1],
          [marqueeBounds.x2, marqueeBounds.y2],
          [marqueeBounds.x1, marqueeBounds.y2],
        ],
        gridGeometry.getPointsAround(center)
      )
    })
  }

  onMouseUp(event) {
    if (this._makingMarqueeSelection) {
      this._selectedTiles = this._getMarqueeSelection()
      this._makingMarqueeSelection = false
    } else if (this._draggingMultiSelect) {
      // we need to offset each selected tile by the amount the mouse moved,
      // we cannot just put each tile where the mouse is as some will not be under the mouse
      // when the mouse went down. calculated to where the mouse went down when
      // dragging started.
      const offset = {
        x: event.offsetX - this._draggingMultiSelectOrigin.x,
        y: event.offsetY - this._draggingMultiSelectOrigin.y,
      }

      // special case for new tiles, there is only one of them at a time
      // so they can just go where the mouse is
      if (this._selectedTiles[0] === this._newTile) {
        offset.x = event.offsetX
        offset.y = event.offsetY
      }

      // determine where each tile is going to be moved to
      const counts = gridGeometry.getTileCounts()
      const overlaps = this._selectedTiles.some((tile) => {
        // figure out where in XY space this tile currently is
        const tileXY = gridGeometry.tileCenterPoint(tile.position)
        // add in the offset of the moved mouse (accounting for DPI)
        tileXY.x = (tileXY.x / devicePixelRatio) + offset.x
        tileXY.y = (tileXY.y / devicePixelRatio) + offset.y
        // convert back to hex coordinates
        tile.newPosition = gridGeometry.getPositionFromScreen(tileXY.x, tileXY.y)
        // check to see if a tile exists at that place
        const overlappingTile = this._findTile(tile.newPosition)
        // if there is an overlapping tile
        if (overlappingTile) {
          // and it's not currently selected
          if (!this._selectedTiles.includes(overlappingTile)) {
            // bail, we are moving a tile to where a tile already exists.
            return true
          }
        }
        if (
          tile.newPosition.x > (counts.width) ||
          tile.newPosition.y > (counts.height)
        ) {
          // bail, we are moving offscreen
          return true
        }
        return false
      })

      // nothing is overlapping
      if (!overlaps) {
        // check to see if has actually moved
        const movedTilesLength = this._selectedTiles.filter(tile => {
          return (
            tile.position.x !== tile.newPosition.x &&
            tile.position.y !== tile.newPosition.y
          )
        }).length
        // if so, notify editing
        if (movedTilesLength > 0) {
          this._setToEditingMode()
        }
        // actually update the tile positions
        this._selectedTiles.forEach((tile) => {
          tile.position = tile.newPosition
          delete tile.newPosition
        })
      } else if (this._selectedTiles[0] === this._newTile) {
        // there exists overlaps on a new tile, remove new tile
        this._newTile = null
        this._selectedTiles.length = 0
      }

      if (this._selectedTiles[0] === this._newTile) {
        // add new tile to list of tiles
        this._tiles.push(this._newTile)
        this._setToEditingMode()
        this.updateUi()
        this._newTile = null
      }
      this._draggingMultiSelect = false
    }
  }

  bodyOnMouseUp() {
    if (this._makingMarqueeSelection) {
      this._makingMarqueeSelection = false
    } else if (this._draggingMultiSelect) {
      this._draggingMultiSelect = false
    }
  }

  onMouseMove(event) {
    if (this._tiles) {
      this._mouseAt = {
        x: event.offsetX,
        y: event.offsetY,
      }
      if (this._makingMarqueeSelection) {
        this._selectedTiles = this._getMarqueeSelection()
      }
      const position = gridGeometry.getPositionFromScreen(
        this._mouseAt.x,
        this._mouseAt.y
      )
      const tile = this._findTile(position)
      if (!tile) {
        this._highlightId = null
        return
      }
      this._highlightId = tile.id
    }
  }

  onDoubleClick(event) {
    if (this._tiles) {
      const position = gridGeometry.getPositionFromScreen(
        event.offsetX,
        event.offsetY
      )
      const tile = this._findTile(position)
      if (tile) {
        this._deselectTile()
        this._selectedTiles = this._tiles.filter((t) => {
          return t.id === tile.id
        })
      }
    }
  }

  onHighlightGeo(id) {
    this._highlightId = id
    this._highlightFromOutsideGrid = true
  }

  resetHighlightedGeo() {
    this._highlightId = null
    this._highlightFromOutsideGrid = false
  }

  onkeydown(event) {
    const key = event.keyCode || event.charCode
    if (key === 8 || key === 46) {
      this._selectedTiles.forEach((tile) => {
        this._deleteTile(tile)
      })
      this._selectedTiles.length = 0
      this._setToEditingMode()
      this.updateUi()
    }
  }

  onChange(callback) {
    this._onChangeCallback = callback
  }

  _deselectTile() {
    if (this._selectedTiles.length !== 0) {
      this._selectedTiles.length = 0
      this._makingMarqueeSelection = false
      this._draggingMultiSelect = false
    }
  }

  onAddTileMouseDown(id) {
    this._deselectTile()
    this._newTile = {
      id,
      position: {
        x: -1,
        y: -1,
      },
    }
    this._draggingMultiSelect = true
    this._draggingMultiSelectOrigin = {
      x: this._mouseAt.x,
      y: this._mouseAt.y,
    }
    this._selectedTiles.length = 0
    this._selectedTiles.push(this._newTile)
  }

  _deleteTile(selected) {
    this._tiles = this._tiles.filter((tile) => {
      return tile.position.x !== selected.position.x || tile.position.y !== selected.position.y
    })
  }

  /** Populate tiles based on given TopoJSON-backed map graphic */
  populateTiles(mapGraphic, properties) {
    const hasProperties = Array.isArray(properties)
    this._tiles = []
    this._deselectTile()
    gridGeometry.forEachTilePosition((x, y) => {
      const point = gridGeometry.tileCenterPoint({x, y})
      const feature = mapGraphic.getFeatureAtPoint(point)
      if (feature) {
        const tile = {
          id: feature.id,
          position: {x, y},
        }
        if (hasProperties) {
          const tileProperty = properties.find(property => {
            return property[0] === feature.id
          })
          if (tileProperty) {
            tile.tilegramValue = tileProperty[1]
          }
        }
        this._tiles.push(tile)
      }
    })
    // save tiles length so the stats does not have a moving target
    this.originalTilesLength = this._tiles.length
    this._hasBeenEdited = false // reset edit state
    this.updateUi()
    this.renderBackgroundImage()
    return this._tiles
  }

  importTiles(tiles) {
    this._deselectTile()
    const maxX = Math.max(...tiles.map(tile => tile.position.x))
    const maxY = Math.max(...tiles.map(tile => tile.position.y))
    gridGeometry.setTileEdgeFromMax(maxX, maxY)
    this._tiles = tiles
    this.renderBackgroundImage()
  }

  getTiles() {
    return this._tiles
  }

  getOriginalTilesLength() {
    return this.originalTilesLength
  }

  _findTile(position) {
    return this._tiles.find(tile => {
      return tile.position.x === position.x && tile.position.y === position.y
    })
  }

  _disableSelectionHighlight() {
    return this._highlightId !== null && this._highlightFromOutsideGrid
  }

  checkForEdits() {
    return this._hasBeenEdited
  }

  renderBackgroundImage() {
    this._backgroundCanvas = document.createElement('canvas')
    this._backgroundCanvas.width = canvasDimensions.width
    this._backgroundCanvas.height = canvasDimensions.height
    const ctx = this._backgroundCanvas.getContext('2d')
    gridGeometry.forEachTilePosition((x, y) => {
      this._drawTile({x, y}, '#fff', {ctx})
    })
  }

  render(ctx) {
    this._ctx = ctx

    this._populateTileIdArray()

    // background pattern
    ctx.drawImage(this._backgroundCanvas, 0, 0);

    // draw tiles and inland borders
    this._tiles.forEach(tile => {
      let color = fipsColor(tile.id)
      if (!this._disableSelectionHighlight() && this._selectedTiles.includes(tile)) {
        color = '#cccccc'
      }
      this._drawTile(tile.position, color, {})
      this._drawInlandBoundaries(tile)
    })

    // draw highlighted region border
    if (this._highlightId && !this._makingMarqueeSelection && !this._draggingMultiSelect) {
      this._drawGeoBorder(this._highlightId)
    }

    // draw selected tiles
    if (this._selectedTiles.length > 0 && !this._disableSelectionHighlight()) {
      this._selectedTiles.forEach((tile) => {
        let position = tile.position
        if (this._draggingMultiSelect) {
          const offset = {
            x: this._mouseAt.x - this._draggingMultiSelectOrigin.x,
            y: this._mouseAt.y - this._draggingMultiSelectOrigin.y,
          }
          if (this._selectedTiles[0] === this._newTile) {
            offset.x = this._mouseAt.x
            offset.y = this._mouseAt.y
          }

          const tileXY = gridGeometry.tileCenterPoint(position)
          tileXY.x = (tileXY.x / devicePixelRatio) + offset.x
          tileXY.y = (tileXY.y / devicePixelRatio) + offset.y
          position = gridGeometry.getPositionFromScreen(tileXY.x, tileXY.y)
        }
        this._drawTile(
          position,
          fipsColor(tile.id),
          {drawStroke: true}
        )
      })
    }

    // draw marquee
    if (this._makingMarqueeSelection) {
      this._drawMarqueeSelection()
    }

    this._drawClusterLabels()
  }

  _drawClusterLabels() {
    const ids = new Set(this._tiles.map(t => t.id))
    ids.forEach((id) => {
      const tiles = this._getTilesById(id)
      const clusters = this._computeClusters(tiles)
      let biggestCluster = []
      clusters.forEach((cluster) => {
        if (cluster.length > biggestCluster.length) {
          biggestCluster = cluster
        }
      })
      const clusterSum = biggestCluster.reduce(
        (previous, point) => {
          return [previous[0] + point[0], previous[1] + point[1]]
        },
        [0, 0]
      )
      const clusterAvg = [
        clusterSum[0] / biggestCluster.length,
        clusterSum[1] / biggestCluster.length,
      ]
      this._ctx.textAlign = 'center'
      this._ctx.textBaseline = 'middle'
      this._ctx.fillStyle = 'black'
      this._ctx.font = `${12.0 * devicePixelRatio}px Fira Sans`
      this._ctx.fillText(fipsToPostal(id), clusterAvg[0], clusterAvg[1])
    })
  }

  _drawMarqueeSelection() {
    const rect = [
      this._marqueeStart.x * devicePixelRatio,
      this._marqueeStart.y * devicePixelRatio,
      (this._mouseAt.x * devicePixelRatio) -
        (this._marqueeStart.x * devicePixelRatio),
      (this._mouseAt.y * devicePixelRatio) -
        (this._marqueeStart.y * devicePixelRatio),
    ]

    // stroke
    this._ctx.strokeStyle = '#333'
    this._ctx.lineWidth = 0.5
    this._ctx.strokeRect(...rect)

    // fill
    this._ctx.globalAlpha = 0.1
    this._ctx.fillStyle = '#666'
    this._ctx.fillRect(...rect)
    this._ctx.globalAlpha = 1.0
  }

  /** http://www.redblobgames.com/gridGeometrys/hexagons/#basics */
  _drawTile(position, fill, {drawStroke, ctx}) {
    drawStroke = drawStroke || false
    ctx = ctx || this._ctx
    const center = gridGeometry.tileCenterPoint(position)
    const points = gridGeometry.getPointsAround(center)
    ctx.beginPath()
    points.forEach((point, index) => {
      const command = (index === 0) ? 'moveTo' : 'lineTo'
      ctx[command](...point)
    })
    ctx.closePath()
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (drawStroke) {
      ctx.strokeStyle = selectedTileBorderColor
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }

  /** Draw border around geo using convex hull algorithm */
  _drawGeoBorder(id) {
    const tiles = this._getTilesById(id)
    const clusters = this._computeClusters(tiles)
    const paths = clusters.map(cluster => hull(
      cluster,
      gridGeometry.getTileEdge() // 'concavity', a.k.a. max edge length
    ))
    paths.forEach(path => {
      this._ctx.beginPath()
      path.forEach((point, index) => {
        const command = (index === 0) ? 'moveTo' : 'lineTo'
        this._ctx[command](...point)
      })
      this._ctx.closePath()
      this._ctx.globalAlpha = 0.75
      this._ctx.strokeStyle = hoveredTileBorderColor
      this._ctx.lineWidth = 2.0
      this._ctx.stroke()
      this._ctx.globalAlpha = 1.0
    })
  }

  /** Compute contiguous outline (convex hull) of given tiles */
  _computeOutlinePaths(tiles) {
    return this._clusters(tiles, true)
  }

  /** Compute clusters returning each cluster for given tiles */
  _computeClusters(tiles) {
    // collect unique points for tiles
    const points = []
    tiles.forEach(tile => {
      const center = gridGeometry.tileCenterPoint(tile.position)
      const hexagonPoints = gridGeometry.getPointsAround(center)
      hexagonPoints.forEach(point => {
        if (points.indexOf(point) === -1) {
          points.push(point)
        }
      })
    })

    // cluster points, returns clusters with indicies to original points
    const dbscan = new DBSCAN()
    const clusters = dbscan.run(
      points,
      gridGeometry.getTileEdge(),  // neighborhood radius
      2                           // min points per cluster
    )
    // deindex and return clusters
    return clusters.map(clusterIndices => clusterIndices.map(index => points[index]))
  }

  /** Check three of six hex sides and determine whether to draw a boundary */
  _drawInlandBoundaries(tile) {
    const {position, id} = tile
    const center = gridGeometry.tileCenterPoint(position)
    const points = gridGeometry.getPointsAround(center)

    const adjacentRight = this._isAbutting(position, {x: 1, y: 0}, id)
    const adjacentLowerRight = this._isAbutting(
      position,
      {x: ((position.y % 2 === 1) ? 0 : 1), y: 1},
      id
    )
    const adjacentLowerLeft = this._isAbutting(
      position,
      {x: ((position.y % 2 === 0) ? 0 : -1), y: 1},
      id
    )

    if (adjacentRight) {
      this._drawBoundaryLine(points[2], points[3])
    }
    if (adjacentLowerRight) {
      this._drawBoundaryLine(points[3], points[4])
    }
    if (adjacentLowerLeft) {
      this._drawBoundaryLine(points[4], points[5])
    }
  }

  _drawBoundaryLine(fromPoint, toPoint) {
    this._ctx.beginPath()
    this._ctx.moveTo(...fromPoint)
    this._ctx.lineTo(...toPoint)
    this._ctx.closePath()
    this._ctx.strokeStyle = selectedTileBorderColor
    this._ctx.lineWidth = 2
    this._ctx.stroke()
  }

  /** Populate once to make boundary calculations faster */
  _populateTileIdArray() {
    const counts = gridGeometry.getTileCounts()
    this._tileIdArray = new Array(counts.width).fill([]).map(() => {
      return new Array(counts.height)
    })
    this._tiles.forEach(tile => {
      this._tileIdArray[tile.position.x][tile.position.y] = tile.id
    })
  }

  _isAbutting(position, offset, checkId) {
    const id = this._tileIdArray[position.x + offset.x][position.y + offset.y]
    return id != null && id !== checkId
  }

  updateUi() {
    if (this._onChangeCallback) {
      this._onChangeCallback()
    }
  }

  /**
   * sets ._hasBeenEdited to true to notify user of possible edit loss
   * ensures UI is in editing mode
   */
  _setToEditingMode() {
    this._hasBeenEdited = true
    this._setUiEditing()
  }

  setUiEditingCallback(callback) {
    this._setUiEditing = callback
  }

  _getTilesById(id) {
    return this._tiles.filter((tile) => tile.id === id)
  }
}
