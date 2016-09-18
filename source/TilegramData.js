import pitchPopulationTilegram from '../tilegrams/pitch-us-population-500k.json'
import nprOneToOneTilegram from '../tilegrams/npr-one-to-one.json'
import fiveThirtyEightElectoralCollegeTilegram from
  '../tilegrams/fivethirtyeight-electoral-college-tilegram.json'

class TilegramData {
  constructor() {
    this._tilegrams = [
      {
        label: 'Pitch U.S. Population 2016 v1',
        topoJson: pitchPopulationTilegram,
      },
      {
        label: 'FiveThirtyEight Electoral College 2016',
        topoJson: fiveThirtyEightElectoralCollegeTilegram,
      },
      {
        label: 'NPR 1-to-1',
        topoJson: nprOneToOneTilegram,
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
