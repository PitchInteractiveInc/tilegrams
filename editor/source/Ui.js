import React from 'react'
import ReactDOM from 'react-dom'

import {createElement} from './utils'
import HexMetrics from './components/HexMetrics'

export default class Ui {
  constructor(geos) {
    this.geos = geos
    this._init()
  }

  setAddTileCallback(callback) {
    this.addTileCallback = callback
  }

  _init() {
    const container = createElement('div')
    container.id = 'ui'
  }

  render(tiles, originalTilesLength) {
    ReactDOM.render(
      (
        <HexMetrics
          geos={this.geos}
          tiles={tiles}
          originalTilesLength={originalTilesLength}
          onAddTileMouseDown={this.addTileCallback} />
      ),
      document.getElementById('ui')
    )
  }
}