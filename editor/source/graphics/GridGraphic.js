import Graphic from './Graphic'
import {fipsColor} from '../utils'
import hexagonGrid from '../HexagonGrid'
import {selectedTileBorderColor, settings} from '../constants'

import React from 'react'
import ReactDOM from 'react-dom'

import HexMetrics from '../components/HexMetrics'

export default class GridGraphic extends Graphic {
  constructor(geos) {
    //TODO: Move HexMetrics out of Grid Graphic
    super()
    this.geos = geos
    this.originalTilesLength = this._tiles ? this._tiles.length : 0
    document.body.onkeydown = this.onkeydown.bind(this)
    this._setUpMetrics()
    this._lastTileEdge = null
  }

  onMouseDown(event) {
    event.preventDefault()
    if (this._tiles) {
      const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
      const tile = this._findTile(position)
      /** Deselect if clicking on null tile, otherwise select tile and/or allow drag */
      if ((this._selectedTile && tile == null) || tile == null) {
        this._selectedTile = null
        return
      }
      if (this._selectedTile != tile) this._selectedTile = tile
      this._selectedTile.shouldDrag = true
    }
  }

  onMouseUp(event) {
    if ((this._selectedTile && !this._selectedTile.shouldDrag) || !this._selectedTile) {
      return
    }

    const position = hexagonGrid.rectToHexPosition(event.offsetX, event.offsetY)
    const tile = this._findTile(position)

    this._selectedTile.shouldDrag = false
    if (this._selectedTile && tile == null) {
      this._selectedTile.position = position
      if (this._selectedTile == this._newTile) {
        /** add new tile to list of tiles only once it's successfully added to the canvas */
        this._tiles.push(this._newTile)
        this._renderMetrics()
        this._newTile = null
      }
    }
  }

  bodyOnMouseUp(event) {
    if (event.target.id === 'canv') return
    if (this._selectedTile && this._selectedTile.shouldDrag) {
      this._selectedTile.shouldDrag = false
      if (this._selectedTile == this._newTile) this._selectedTile = null
        this._newTile = null
    }
  }

  onMouseMove(event) {
    if (this._tiles) {
      this._mouseAt = {
        x: event.offsetX,
        y: event.offsetY,
      }
    }
  }

  onkeydown(event) {
    let key = event.keyCode || event.charCode
    if( key == 8 || key == 46 ) {
      if (this._selectedTile) {
        this._deleteTile(this._selectedTile)
        this._renderMetrics()
        this._selectedTile = null
      }
      return
    }
  }

  _deselectTile() {
    if (this._selectedTile) {
      this._selectedTile.shouldDrag = false
      this._selectedTile = null
    }
  }

  onAddTileMouseDown(event) {
    event.preventDefault()
    this._deselectTile()
    this._newTile = {
      id: event.currentTarget.id,
      position: {
        x: null,
        y: null
      },
      shouldDrag: true
    }
    this._mouseAt = {x: -1, y: -1}
    this._selectedTile = this._newTile
  }

  _deleteTile(selected) {
    this._tiles = this._tiles.filter((tile) => {
      return tile.position.x != selected.position.x || tile.position.y != selected.position.y
    })
  }

  /** Populate tiles based on given TopoJSON-backed map graphic */
  populateTiles(mapGraphic) {
    if (this._lastTileEdge === settings.tileEdge) return
    this._lastTileEdge = settings.tileEdge
    this._tiles = []
    hexagonGrid.forEachTilePosition((x, y) => {
      const point = hexagonGrid.tileCenterPoint({x, y})
      const feature = mapGraphic.getFeatureAtPoint(point)
      if (feature) {
        this._tiles.push({
          id: feature.id,
          position: {x, y}
        })
      }
    })
    this._renderMetrics()
    return this._tiles
  }

  getTiles() {
    return this._tiles
  }

  _findTile(position) {
    return this._tiles.find(tile => {
      return tile.position.x == position.x && tile.position.y == position.y
    })
  }

  render(ctx) {
    this._ctx = ctx
    this._tiles.forEach(tile => {
      let color = fipsColor(tile.id)
      if (tile == this._selectedTile) {
        color = '#cccccc'
      }
      this._drawTile(tile.position, color)
    })
    if (this._selectedTile) {
      let position = this._selectedTile.shouldDrag ?
        hexagonGrid.rectToHexPosition(this._mouseAt.x, this._mouseAt.y) :
        this._selectedTile.position
      this._drawTile(
        position,
        fipsColor(this._selectedTile.id),
        true
      )
    }
  }

  /** http://www.redblobgames.com/hexagonGrids/hexagons/#basics */
  _drawTile(position, fill, superstroke) {
    const center = hexagonGrid.tileCenterPoint(position)
    this._ctx.beginPath()
    this._ctx.moveTo.apply(this._ctx, hexagonGrid.getUpperLeftPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getUpperRightPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getRightPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getLowerRightPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getLowerLeftPoint(center))
    this._ctx.lineTo.apply(this._ctx, hexagonGrid.getLeftPoint(center))
    this._ctx.closePath()
    this._ctx.fillStyle = fill
    this._ctx.globalAlpha = 0.6
    this._ctx.fill()
    this._ctx.globalAlpha = 1.0
    if (superstroke) {
      this._ctx.strokeStyle = selectedTileBorderColor
      this._ctx.lineWidth = 3
      this._ctx.stroke()
    }
  }

  _setUpMetrics() {
    const container = document.createElement('div')
    container.id = 'metrics'
    document.body.appendChild(container)
  }

  _renderMetrics() {
    ReactDOM.render(
      (
        <HexMetrics
          geos={this.geos}
          tiles={this._tiles}
          originalTilesLength={this.originalTilesLength}
          onAddTileMouseDown={this.onAddTileMouseDown.bind(this)} />
      ),
      document.getElementById('metrics')
    )
  }
}
