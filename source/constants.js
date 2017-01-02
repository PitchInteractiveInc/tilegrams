import dat from 'dat-gui'

const devicePixelRatio = window.devicePixelRatio

const canvasDimensions = {
  width: 0,
  height: 0,
}
/**
 * update canvasDimensions ensuring that there is always a min w/h
 * prevent errors on small screens
 */
function updateCanvasSize() {
  const canvasContainer = document.getElementById('canvas')
  canvasDimensions.width = Math.max(200, canvasContainer.offsetWidth * devicePixelRatio)
  canvasDimensions.height = Math.max(200, canvasContainer.offsetHeight * devicePixelRatio)
}

/**
 * target min and max number of tiles for map output
 * used to calculate a dataset's domain
 */
const nTileDomain = [80, 1000]

/** dat.gui for realtime updating of properties */
class Settings {
  constructor() {
    this.tileScale = 0.95
    this.displayMap = true
    this.displayGrid = true
  }
}
const settings = new Settings()
const gui = new dat.GUI()
gui.add(settings, 'tileScale', 0.9, 1.0)
gui.add(settings, 'displayMap')
gui.add(settings, 'displayGrid')
dat.GUI.toggleHide()

module.exports = {
  settings,
  devicePixelRatio,
  canvasDimensions,
  updateCanvasSize,
  nTileDomain,
  tileEdgeRange: {
    default: 20,
    min: 10,
    max: 40,
  },
  selectedTileBorderColor: '#737373',
  hoveredTileBorderColor: '#737373',
  movingTileOriginalPositionColor: '#d0d2d3',
}
