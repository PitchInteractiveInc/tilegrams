require("./source/css/main.scss")

import {csvParseRows} from 'd3-dsv'
import canvas from './source/Canvas'
import Ui from './source/Ui'
import exporter from './source/file/Exporter'

import usTopoJson from '../../../data/us-110m.topo.json'
import usPopulationCsv from '../../../data/us-state-population.csv'

// geos must be updated when topoJson is updated
const geos = [...new Set(usTopoJson.objects.states.geometries.map((feature) => feature.id))]

const ui = new Ui(geos)

// events
canvas.getGrid().onChange(() => updateUi())
ui.setAddTileCallback((event) => canvas.getGrid().onAddTileMouseDown(event))

canvas.computeCartogram({
  topoJson: usTopoJson,
  properties: csvParseRows(usPopulationCsv),
})

updateUi()

function updateUi() {
  ui.render(
    canvas.getGrid().getTiles(),
    canvas.getGrid().getOriginalTilesLength
  )
}

// export functionality is command-line only for the moment
window.exportToTopoJson = () => {
  const outputTopoJson = translator.toTopoJson(canvas.getTiles())
  console.log(JSON.stringify(outputTopoJson));
}
