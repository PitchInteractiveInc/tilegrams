import pitchElectoralCollege2012Tilegram from '../../tilegrams/pitch-electoral-college-2012.json'
import pitchElectoralCollege2004Tilegram from '../../tilegrams/pitch-electoral-college-2004.json'
import pitchElectoralCollege1992Tilegram from '../../tilegrams/pitch-electoral-college-1992.json'
import pitchPopulationTilegram from '../../tilegrams/pitch-us-population-500k.json'
import fiveThirtyEightElectoralCollegeTilegram from
  '../../tilegrams/fivethirtyeight-electoral-college-tilegram.json'
import nprOneToOneTilegram from '../../tilegrams/npr-one-to-one.json'

class TilegramResource {
  constructor() {
    this._tilegrams = [
      {
        label: 'Pitch Electoral College 2012-2020',
        topoJson: pitchElectoralCollege2012Tilegram,
      },
      {
        label: 'Pitch Electoral College 2004-2008',
        topoJson: pitchElectoralCollege2004Tilegram,
      },
      {
        label: 'Pitch Electoral College 1992-2000',
        topoJson: pitchElectoralCollege1992Tilegram,
      },
      {
        label: 'Pitch U.S. Population 2016',
        topoJson: pitchPopulationTilegram,
      },
      {
        label: 'FiveThirtyEight Electoral College',
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

export default new TilegramResource()
