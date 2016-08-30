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

export default new Ui()
