import Canvas from './source/Canvas'
import {createElement} from './source/utils'
import {csvParseRows} from 'd3-dsv'

// raw inputs
import usTopoJson from '../../../data/us-110m.topo.json'
import usPopulationCsv from '../../../data/us-state-population.csv'

const canvas = new Canvas()

canvas.computeCartogram({
  topoJson: usTopoJson,
  properties: csvParseRows(usPopulationCsv),
})

const tiles = canvas.getTiles()
