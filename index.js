import data from './source/Data'
import canvas from './source/Canvas'
import ui from './source/Ui'
import exporter from './source/file/Exporter'
import mapData from './source/MapData'
import hexagonGrid from './source/HexagonGrid'
import {startDownload, isDevEnvironment} from './source/utils'

require('./source/css/main.scss')

function selectDataset(dataset) {
  ui.setSelectedDataset(dataset)
  canvas.computeCartogram({
    topoJson: mapData.getTopoJson(),
    properties: dataset,
  })
}

function updateUi() {
  ui.render(
    canvas.getGrid().getTiles(),
    canvas.getGrid().getOriginalTilesLength()
  )
}

function confirmNavigation(e) {
  // most browsers won't let you display custom text but have something like this anyway
  const message = 'Are you sure you want to leave this page? You will lose any unsaved work.'
  e.returnValue = message
  return message
}

// wire up callbacks
function init() {
  canvas.getGrid().onChange(() => updateUi())
  ui.setAddTileCallback(id => canvas.getGrid().onAddTileMouseDown(id))
  ui.setDatasetSelectedCallback(index => selectDataset(data.getDataset(index)))
  ui.setCustomDatasetCallback(csv => selectDataset(data.parseCsv(csv)))
  ui.setHightlightCallback(id => canvas.getGrid().onHighlightGeo(id))
  ui.setUnhighlightCallback(() => canvas.getGrid().resetHighlightedGeo())
  ui.setResolutionChangedCallback((metricPerTile, sumMetrics) => {
    ui.metricPerTile = metricPerTile
    canvas.updateTilesFromMetrics(metricPerTile, sumMetrics)
  })
  ui.setExportCallback(() => {
    const json = exporter.formatTopoJson(canvas.getGrid().getTiles())
    startDownload({
      filename: 'hexagon-cartogram.json',
      mimeType: 'application/json',
      content: JSON.stringify(json),
    })
  })

  // populate
  ui.setGeos(mapData.getUniqueFeatureIds())
  ui.setDatasetLabels(data.getLabels())
  selectDataset(data.getDataset(0))
  updateUi()
  if (!isDevEnvironment()) {
    window.addEventListener('beforeunload', confirmNavigation)
  }
}

init()
