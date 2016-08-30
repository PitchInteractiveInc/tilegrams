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
ui.setDatasetSelectedCallback(index => selectDataset(data.getDataset(index)))
ui.setCustomDatasetCallback(csv => selectDataset(data.parseCsv(csv)))
ui.setHightlightCallback((event) => canvas.getGrid().onHighlightGeo(event))
ui.setUnhighlightCallback(() => canvas.getGrid().resetHighlightedGeo())

selectDataset(data.getDataset(0))
updateUi()

function selectDataset(dataset) {
  ui.setSelectedDataset(dataset)
  canvas.computeCartogram({
    topoJson: usTopoJson,
    properties: dataset,
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
