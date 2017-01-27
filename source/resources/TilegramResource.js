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
        geography: 'United States',
      },
      {
        label: 'Pitch U.S. Population 2016',
        topoJson: pitchPopulationTilegram,
        geography: 'United States',
      },
      {
        label: 'FiveThirtyEight Electoral College',
        topoJson: fiveThirtyEightElectoralCollegeTilegram,
        geography: 'United States',
      },
      {
        label: 'NPR 1-to-1',
        topoJson: nprOneToOneTilegram,
        geography: 'United States',
      },
    ]
  }

  getLabels() {
    return this._tilegrams.map(tilegram => tilegram.label)
  }

  getTilegram(geography, index) {
    console.log(geography)
    return this.getTilegramsByGeography(geography)[index].topoJson
  }

  getTilegramsByGeography(geography) {
    return this._tilegrams.filter(tilegram => tilegram.geography === geography)
  }
}

export default new TilegramResource()
