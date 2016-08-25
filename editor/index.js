import React from 'react'
import ReactDOM from 'react-dom'

import HexMetrics from './source/components/HexMetrics'
import Canvas from './source/Canvas'
import Grid from './source/Grid'
import Translator from './source/Translator'

// TEMP: load data from filesystem
import usHexagonTopoJson from '../../../data/tiles-raw.geo.json'

// translate TopoJSON
const translator = new Translator()
const tiles = translator.fromTopoJson(usHexagonTopoJson)

// init canvas and grid
const canvas = new Canvas()
const grid = new Grid(tiles)
canvas.include(grid)

const container = document.createElement('div')
container.id = 'editor'
document.body.appendChild(container)

ReactDOM.render(
  (
    <HexMetrics />
  ),
  document.getElementById('editor')
)
