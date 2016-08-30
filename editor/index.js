require("./source/css/main.scss")

import data from './source/Data'
import canvas from './source/Canvas'
import ui from './source/Ui'
import exporter from './source/file/Exporter'

import {onExportTopoJson} from './source/constants'
import {startDownload} from './source/utils'

import usTopoJson from '../../../data/us-110m.topo.json'

// geos must be updated when topoJson is updated
const geometries = usTopoJson.objects.states.geometries
ui.setGeos([...new Set(geometries.map((feature) => feature.id))])
ui.setDatasetLabels(data.getLabels())

// events
canvas.getGrid().onChange(() => updateUi())
ui.setAddTileCallback(event => canvas.getGrid().onAddTileMouseDown(event))
ui.setDatasetSelectedCallback(index => updateCartogram(index))

updateCartogram(0)
updateUi()

function updateCartogram(index) {
  canvas.computeCartogram({
    topoJson: usTopoJson,
    properties: data.getDataset(index),
  })
}

function updateUi() {
  ui.render(
    canvas.getGrid().getTiles(),
    canvas.getGrid().getOriginalTilesLength()
  )
}

onExportTopoJson(() => {
  const json = exporter.formatTopoJson(canvas.getGrid().getTiles())
  startDownload({
    filename: 'hexagon-cartogram.json',
    mimeType: 'application/json',
    content: JSON.stringify(json),
  })
})
