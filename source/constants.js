import dat from 'dat-gui'

const devicePixelRatio = 2.0

const canvasDimensions = {
  width: 0,
  height: 0,
}
function updateCanvasSize() {
  const canvasContainer = document.getElementById('canvas')
  canvasDimensions.width = canvasContainer.offsetWidth * devicePixelRatio
  canvasDimensions.height = canvasContainer.offsetHeight * devicePixelRatio
}

/**
 * target min and max number of tiles for map output
 * used to calculate a dataset's domain
 */
const nTileDomain = [80, 8000]

/** dat.gui for realtime updating of properties */
class Settings {
  constructor() {
    this.tileScale = 0.95
    this.hueScalar = 5
    this.displayMap = true
    this.displayGrid = true
  }
}
const settings = new Settings()
const gui = new dat.GUI()
gui.add(settings, 'tileScale', 0.9, 1.0)
gui.add(settings, 'hueScalar', 1, 10)
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
  selectedTileBorderColor: '#333333',
  hoveredTileBorderColor: '#333333',
}
