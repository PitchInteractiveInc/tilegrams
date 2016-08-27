import Canvas from './source/Canvas'
import {createElement} from './source/utils'

// TEMP: load data from filesystem
import usTopoJson from '../../../data/cartogram.geo.json'

const canvas = new Canvas(usTopoJson)

const tiles = canvas.getTiles()
