import data from './source/Data'
import canvas from './source/Canvas'
import ui from './source/Ui'
import exporter from './source/file/Exporter'
import importer from './source/file/Importer'
import mapData from './source/MapData'
import tilegramData from './source/TilegramData'
import gridGeometry from './source/geometry/GridGeometry'
import {startDownload, isDevEnvironment} from './source/utils'
import {updateCanvasSize} from './source/constants'

require('./source/css/main.scss')
require('font-awesome/scss/font-awesome.scss')

const CARTOGRAM_COMPUTE_FPS = 60.0

let cartogramComputeTimer

let importing = false

function selectDataset(dataset) {
  importing = false
  ui.setSelectedDataset(dataset)
  canvas.computeCartogram(dataset)
  clearInterval(cartogramComputeTimer)
  cartogramComputeTimer = setInterval(() => {
    canvas.iterateCartogram()
  }, 1000.0 / CARTOGRAM_COMPUTE_FPS)
}

function updateUi() {
  ui.setTiles(
    canvas.getGrid().getTiles(),
    canvas.getGrid().getOriginalTilesLength()
  )
  ui.render()
}

function loadTopoJson(topoJson) {
  importing = true
  const tiles = importer.fromTopoJson(topoJson)
  const datasetMap = {}
  tiles.forEach((tile) => {
    datasetMap[tile.id] = [tile.id, tile.tilegramValue]
  })
  const dataset = Object.keys(datasetMap).map((row) => datasetMap[row])
  ui.setSelectedDataset(dataset)
  ui.metricPerTile = importer.metricPerTile
  exporter.metricPerTile = importer.metricPerTile

  canvas.importTiles(tiles, importer.cartogramArea)
  updateUi()
}

function confirmNavigation(e) {
  // most browsers won't let you display custom text but have something like this anyway
  const message = 'Are you sure you want to leave this page? You will lose any unsaved work.'
  e.returnValue = message
  return message
}

function init() {
  // wire up callbacks
  canvas.getGrid().onChange(() => updateUi())
  canvas.getGrid().setUiEditingCallback(() => ui.setEditingTrue())
  ui.setAddTileCallback(id => canvas.getGrid().onAddTileMouseDown(id))
  ui.setDatasetSelectedCallback(index => selectDataset(data.getDataset(index)))
  ui.setTilegramSelectedCallback(index => {
    loadTopoJson(tilegramData.getTilegram(index))
  })
  ui.setCustomDatasetCallback(csv => selectDataset(data.parseCsv(csv)))
  ui.setHightlightCallback(id => canvas.getGrid().onHighlightGeo(id))
  ui.setUnhighlightCallback(() => canvas.getGrid().resetHighlightedGeo())
  ui.setResolutionChangedCallback((metricPerTile, sumMetrics) => {
    ui.metricPerTile = metricPerTile
    exporter.metricPerTile = metricPerTile
    if (importing) {
      return
    }
    canvas.updateTilesFromMetrics(metricPerTile, sumMetrics)
  })
  ui.setUnsavedChangesCallback(() => canvas.getGrid().checkForEdits())
  ui.setExportCallback(() => {
    const json = exporter.toTopoJson(canvas.getGrid().getTiles())
    startDownload({
      filename: 'tiles.topo.json',
      mimeType: 'application/json',
      content: JSON.stringify(json),
    })
  })
  ui.setExportSvgCallback(() => {
    const svg = exporter.toSvg(canvas.getGrid().getTiles())
    startDownload({
      filename: 'tiles.svg',
      mimeType: 'image/svg+xml',
      content: svg,
    })
  })
  ui.setImportCallback(loadTopoJson)

  // populate
  ui.setGeos(mapData.getUniqueFeatureIds())
  ui.setDatasetLabels(data.getLabels())
  ui.setTilegramLabels(tilegramData.getLabels())
  loadTopoJson(tilegramData.getTilegram(0))
  updateUi()
  if (!isDevEnvironment()) {
    window.addEventListener('beforeunload', confirmNavigation)
  }
}

function resize() {
  updateCanvasSize()
  canvas.resize()
  gridGeometry.resize()
  canvas.getMap().updatePreProjection()
}
window.onresize = resize
resize()

init()
