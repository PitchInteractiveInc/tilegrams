import hull from 'hull.js'
import {DBSCAN} from 'density-clustering'

import Graphic from './Graphic'
import {fipsColor, fipsToPostal} from '../utils'
import hexagonGrid from '../HexagonGrid'
import {
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
    this._mouseAt = {x: 0, y: 0}
    document.body.onkeydown = this.onkeydown.bind(this)
  }

  onMouseDown(event) {
    event.preventDefault()
    const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
    const tile = this._findTile(position)
    if (tile == null || this._selectedTiles.includes(tile)) {
      this._onMarqueeMouseDown(event)
    } else {
      this._onArrowMouseDown(event)
    }
  }

  _onArrowMouseDown(event) {
    if (this._tiles) {
      const position = hexagonGrid.rectToHexPosition(
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
        const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
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

  onMouseUp(event) {
    if (this._makingMarqueeSelection) {
      const marqueeBounds = {
        x1: Math.min(this._marqueeStart.x, this._mouseAt.x),
        x2: Math.max(this._marqueeStart.x, this._mouseAt.x),
        y1: Math.min(this._marqueeStart.y, this._mouseAt.y),
        y2: Math.max(this._marqueeStart.y, this._mouseAt.y),
      }
      this._selectedTiles = this._tiles.filter((tile) => {
        const center = hexagonGrid.tileCenterPoint(tile.position)
        center.x /= devicePixelRatio
        center.y /= devicePixelRatio
        return center.x > marqueeBounds.x1 && center.x < marqueeBounds.x2 &&
          center.y > marqueeBounds.y1 && center.y < marqueeBounds.y2
      })
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
      const overlaps = this._selectedTiles.some((tile) => {
        // figure out where in XY space this tile currently is
        const tileXY = hexagonGrid.tileCenterPoint(tile.position)
        // add in the offset of the moved mouse (accounting for DPI)
        tileXY.x = (tileXY.x / devicePixelRatio) + offset.x
        tileXY.y = (tileXY.y / devicePixelRatio) + offset.y
        // convert back to hex coordinates
        tile.newPosition = hexagonGrid.rectToHexPosition(tileXY.x, tileXY.y)
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
        return false
      })

      // nothing is overlapping
      if (!overlaps) {
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
      const position = hexagonGrid.rectToHexPosition(
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
      const position = hexagonGrid.rectToHexPosition(
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
  }

  resetHighlightedGeo() {
    this._highlightId = null
  }

  onkeydown(event) {
    const key = event.keyCode || event.charCode
    if (key === 8 || key === 46) {
      this._selectedTiles.forEach((tile) => {
        this._deleteTile(tile)
      })
      this._selectedTiles.length = 0
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
        x: null,
        y: null,
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
  populateTiles(mapGraphic) {
    this._tiles = []
    this._deselectTile()
    hexagonGrid.forEachTilePosition((x, y) => {
      const point = hexagonGrid.tileCenterPoint({x, y})
      const feature = mapGraphic.getFeatureAtPoint(point)
      if (feature) {
        this._tiles.push({
          id: feature.id,
          position: {x, y},
        })
      }
    })
    // save tiles length so the stats does not have a moving target
    this.originalTilesLength = this._tiles.length
    this.updateUi()
    return this._tiles
  }

  importTiles(tiles) {
    const maxX = Math.max(...tiles.map(tile => tile.position.x))
    const maxY = Math.max(...tiles.map(tile => tile.position.y))
    hexagonGrid.setTileEdgeFromMax(maxX, maxY)
    this._tiles = tiles
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

  render(ctx) {
    this._ctx = ctx
    this._tiles.forEach(tile => {
      let color = fipsColor(tile.id)
      if (this._selectedTiles.includes(tile)) {
        color = '#cccccc'
      }
      this._drawTile(tile.position, color)
    })

    if (this._highlightId) {
      this._drawGeoBorder(this._highlightId)
    }

    if (this._selectedTiles.length > 0) {
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

          const tileXY = hexagonGrid.tileCenterPoint(position)
          tileXY.x = (tileXY.x / devicePixelRatio) + offset.x
          tileXY.y = (tileXY.y / devicePixelRatio) + offset.y
          position = hexagonGrid.rectToHexPosition(tileXY.x, tileXY.y)
        }
        this._drawTile(
          position,
          fipsColor(tile.id),
          true
        )
      })
    }
    if (this._makingMarqueeSelection) {
      this._drawMarqueeSelection()
    }

    if (this._highlightId) {
      this._ctx.fillStyle = 'black'
      this._ctx.font = '24px Arial'
      this._ctx.fillText(fipsToPostal(this._highlightId), 20, 40)
    }
  }

  _drawMarqueeSelection() {
    const rect = [
      this._marqueeStart.x * devicePixelRatio,
      this._marqueeStart.y * devicePixelRatio,
      (this._mouseAt.x * devicePixelRatio) -
        (this._marqueeStart.x * devicePixelRatio),
      (this._mouseAt.y * devicePixelRatio) -
        (this._marqueeStart.y * devicePixelRatio)
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

  /** http://www.redblobgames.com/hexagonGrids/hexagons/#basics */
  _drawTile(position, fill, superstroke) {
    const center = hexagonGrid.tileCenterPoint(position)
    this._ctx.beginPath()
    this._ctx.moveTo(...hexagonGrid.getUpperLeftPoint(center))
    this._ctx.lineTo(...hexagonGrid.getUpperRightPoint(center))
    this._ctx.lineTo(...hexagonGrid.getRightPoint(center))
    this._ctx.lineTo(...hexagonGrid.getLowerRightPoint(center))
    this._ctx.lineTo(...hexagonGrid.getLowerLeftPoint(center))
    this._ctx.lineTo(...hexagonGrid.getLeftPoint(center))
    this._ctx.closePath()
    if (fill) {
      this._ctx.fillStyle = fill
      this._ctx.fill()
    }
    if (superstroke) {
      this._ctx.strokeStyle = selectedTileBorderColor
      this._ctx.lineWidth = 1.5
      this._ctx.stroke()
    }
  }

  /** Draw border around geo using convex hull algorithm */
  _drawGeoBorder(id) {
    const tiles = this._getTilesById(id)
    const paths = this._computeOutlinePaths(tiles)
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
    // collect unique points for tiles
    const points = []
    tiles.forEach(tile => {
      const center = hexagonGrid.tileCenterPoint(tile.position)
      const hexagonPoints = [
        hexagonGrid.getUpperLeftPoint(center),
        hexagonGrid.getUpperRightPoint(center),
        hexagonGrid.getRightPoint(center),
        hexagonGrid.getLowerRightPoint(center),
        hexagonGrid.getLowerLeftPoint(center),
        hexagonGrid.getLeftPoint(center),
      ]
      hexagonPoints.forEach(point => {
        if (points.indexOf(point) === -1) {
          points.push(point)
        }
      })
    })

    // cluster points
    const dbscan = new DBSCAN()
    const clusters = dbscan.run(
      points,
      hexagonGrid.getTileEdge(),  // neighborhood radius
      2                           // min points per cluster
    )

    // return paths
    return clusters.map(clusterIndices => {
      const clusterPoints = clusterIndices.map(index => points[index])
      return hull(
        clusterPoints,
        hexagonGrid.getTileEdge() // 'concavity', a.k.a. max edge length
      )
    })
  }

  updateUi() {
    if (this._onChangeCallback) {
      this._onChangeCallback()
    }
  }

  _getTilesById(id) {
    return this._tiles.filter((tile) => tile.id === id)
  }
}
