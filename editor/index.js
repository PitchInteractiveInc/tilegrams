import React from 'react'
import ReactDOM from 'react-dom'

import HexMetrics from './source/components/HexMetrics'
import Canvas from './source/Canvas'
import {createElement} from './source/utils'

// TEMP: load data from filesystem
import usTopoJson from '../../../data/cartogram.geo.json'

const canvas = new Canvas(usTopoJson)

const tiles = canvas.updateTiles()

ReactDOM.render(
  <HexMetrics tiles={tiles} />,
  createElement()
)
