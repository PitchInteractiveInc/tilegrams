import React from 'react'
import ReactDOM from 'react-dom'

import {createElement} from './utils'
import HexMetrics from './components/HexMetrics'

class Ui {
  constructor() {
    this._init()
  }

  setGeos(geos) {
    this.geos = geos
  }

  setAddTileCallback(callback) {
    this.addTileCallback = callback
  }

  _init() {
    this._container = createElement({id: 'ui'})
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
      this._container
    )
  }
}

export default new Ui()
