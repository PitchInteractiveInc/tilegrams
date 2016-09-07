import Graphic from './Graphic'
import {fipsColor, fipsToPostal} from '../utils'
import hexagonGrid from '../HexagonGrid'
import {selectedTileBorderColor} from '../constants'

export default class GridGraphic extends Graphic {
  constructor() {
    super()
    this.originalTilesLength = 0
    this._highlights = []
    this._hoveredLabel = null
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
      const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
      const tile = this._findTile(position)
      /** Deselect if clicking on null tile, otherwise select tile and/or allow drag */
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
        center.x /= 2
        center.y /= 2
        return center.x > marqueeBounds.x1 && center.x < marqueeBounds.x2 &&
          center.y > marqueeBounds.y1 && center.y < marqueeBounds.y2
      })
      this._makingMarqueeSelection = false
    } else if (this._draggingMultiSelect) {
      const offset = {
        x: event.offsetX - this._draggingMultiSelectOrigin.x,
        y: event.offsetY - this._draggingMultiSelectOrigin.y,
      }
      if (this._selectedTiles[0] === this._newTile) {
        offset.x = event.offsetX
        offset.y = event.offsetY
      }

      // assign `newPosition` to each tile
      const overlaps = this._selectedTiles.some((tile) => {
        const tileXY = hexagonGrid.tileCenterPoint(tile.position)
        tileXY.x = (tileXY.x * 0.5) + offset.x
        tileXY.y = (tileXY.y * 0.5) + offset.y
        tile.newPosition = hexagonGrid.rectToHexPosition(tileXY.x, tileXY.y)
        const overlappingTile = this._findTile(tile.newPosition)
        // if there is an overlapping tile
        if (overlappingTile) {
          // and it's not currently selected
          if (!this._selectedTiles.includes(overlappingTile)) {
            // bail
            return true
          }
        }
        return false
      })

      if (!overlaps) {
        this._selectedTiles.forEach((tile) => {
          tile.position = tile.newPosition
          delete tile.newPosition
        })
      } else if (this._selectedTiles[0] === this._newTile) {
        this._newTile = null
        this._selectedTiles.length = 0
      }

      if (this._selectedTiles[0] === this._newTile) {
        /** add new tile to list of tiles only once it's successfully added to the canvas */
        this._tiles.push(this._newTile)
        this.updateUi()
        this._newTile = null
        console.log('add new tile')
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
      const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
      const tile = this._findTile(position)
      if (!tile) {
        this._hoveredLabel = null
        return
      }
      const postal = fipsToPostal(tile.id)
      this._hoveredLabel = postal
    }
  }

  onHighlightGeo(id) {
    this._highlights = this._tiles.filter((tile) => tile.id === id)
  }

  resetHighlightedGeo() {
    this._highlights = []
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
    // this._mouseAt = {x: -1, y: -1}
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
    this._highlights.forEach(tile => {
      this._drawTile(tile.position, null, true)
    })

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
          tileXY.x = (tileXY.x * 0.5) + offset.x
          tileXY.y = (tileXY.y * 0.5) + offset.y
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
  }

  _drawMarqueeSelection() {
    this._ctx.strokeStyle = 'black'
    this._ctx.strokeRect(
      this._marqueeStart.x * 2,
      this._marqueeStart.y * 2,
      (this._mouseAt.x * 2) - (this._marqueeStart.x * 2),
      (this._mouseAt.y * 2) - (this._marqueeStart.y * 2)
    )
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
      this._ctx.lineWidth = 3
      this._ctx.stroke()
    }
  }

  updateUi() {
    if (this._onChangeCallback) {
      this._onChangeCallback()
    }
  }
}
