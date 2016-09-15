import pitchPopulationTilegram from '../tilegrams/pitch-us-population-500k.json'

class TilegramData {
  constructor() {
    this._tilegrams = [
      {
        label: 'Pitch U.S. Population 2016',
        topoJson: pitchPopulationTilegram,
      },
    ]
  }

  getLabels() {
    return this._tilegrams.map(tilegram => tilegram.label)
  }

  getTilegram(index) {
    return this._tilegrams[index].topoJson
  }
}

export default new TilegramData()
