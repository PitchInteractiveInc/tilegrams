import React from 'react'
import ReactDOM from 'react-dom'

import HexMetrics from './source/components/HexMetrics'
import Canvas from './source/Canvas'
import Grid from './source/Grid'

const canvas = new Canvas()
const map = new Grid()
canvas.include(map)

const container = document.createElement('div')
container.id = 'editor'
document.body.appendChild(container)

ReactDOM.render(
  (
    <HexMetrics />
  ),
  document.getElementById('editor')
)