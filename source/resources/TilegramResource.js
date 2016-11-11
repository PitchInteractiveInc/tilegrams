import pitchElectoralCollegeTilegram from '../../tilegrams/pitch-electoral-college.json'
import pitchPopulationTilegram from '../../tilegrams/pitch-us-population-500k.json'
import nprOneToOneTilegram from '../../tilegrams/npr-one-to-one.json'
import fiveThirtyEightElectoralCollegeTilegram from
  '../../tilegrams/fivethirtyeight-electoral-college-tilegram.json'

class TilegramResource {
  constructor() {
    this._tilegrams = [
      {
        label: 'Pitch Electoral College',
        topoJson: pitchElectoralCollegeTilegram,
        geography: 'usa',
      },
      {
        label: 'Pitch U.S. Population 2016',
        topoJson: pitchPopulationTilegram,
        geography: 'usa',
      },
      {
        label: 'FiveThirtyEight Electoral College',
        topoJson: fiveThirtyEightElectoralCollegeTilegram,
        geography: 'usa',
      },
      {
        label: 'NPR 1-to-1',
        topoJson: nprOneToOneTilegram,
        geography: 'usa',
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

export default new TilegramResource()
