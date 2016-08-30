import dat from 'dat-gui'

const canvasDimensions = {
  width: 960 * 2,
  height: 720 * 2,
}

/** dat.gui for realtime updating of properties */
class Settings {
  constructor() {
    this.tileEdge = 20
    this.tileScale = 0.95
    this.hueScalar = 5
    this.displayMap = true
    this.displayGrid = true
    this.exportTopoJson = () => {
      if (exportTopoJsonHandler) {
        exportTopoJsonHandler()
      }
    }
  }
}
const settings = new Settings()
const gui = new dat.GUI()
const tileEdgeSetting = gui.add(settings, 'tileEdge', 10, 40)
gui.add(settings, 'tileScale', 0.9, 1.0)
gui.add(settings, 'hueScalar', 1, 10)
gui.add(settings, 'displayMap')
gui.add(settings, 'displayGrid')
gui.add(settings, 'exportTopoJson')
dat.GUI.toggleHide()

let exportTopoJsonHandler
function onExportTopoJson(handler) {
  exportTopoJsonHandler = handler
}

module.exports = {
  settings,
  tileEdgeSetting,
  onExportTopoJson,
  canvasDimensions,
  selectedTileBorderColor: '#333333',
}
