import pitchElectoralCollegeTilegram from '../../tilegrams/pitch-electoral-college.json'
import pitchPopulationTilegram from '../../tilegrams/pitch-us-population-500k.json'
import nprOneToOneTilegram from '../../tilegrams/npr-one-to-one.json'
import fiveThirtyEightElectoralCollegeTilegram from
  '../../tilegrams/fivethirtyeight-electoral-college-tilegram.json'
import francePopulationTilegram from '../../tilegrams/france-population.json'
import francePopulationWithOverseasTilegram from
  '../../tilegrams/france-population-with-overseas.json'
import franceOneToOneDepartmentsTilegram from '../../tilegrams/france-departments-one-to-one.json'
import germanyOneToOneConstituenciesTilegram from '../../tilegrams/germany-constituencies.json'
import usCongress2018 from '../../tilegrams/us-congressional-districts-2018.json'
import usCongress2018brokenOut from '../../tilegrams/us-congressional-districts-2018-brokenout.json'
import brazilStatesPopulation2018 from '../../tilegrams/brazil-states-population.json'
import ukRegions from '../../tilegrams/uk-regions.json';
import indiaConstituencies from '../../tilegrams/india-constituencies.json';

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
      {
        label: 'U.S. Congressional Districts 2018',
        topoJson: usCongress2018,
        geography: 'United States',
      },
      {
        label: 'U.S. Congressional Districts 2018 Broken Out By State',
        topoJson: usCongress2018brokenOut,
        geography: 'United States',
      },
      {
        label: 'France Population',
        topoJson: francePopulationTilegram,
        geography: 'France - Regions',
      },
      {
        label: 'France Population With Overseas',
        topoJson: francePopulationWithOverseasTilegram,
        geography: 'France - Regions',
      },
      {
        label: 'France Departments 1-to-1',
        topoJson: franceOneToOneDepartmentsTilegram,
        geography: 'France - Departments',
      },
      {
        label: 'Germany Constituencies 1-to-1',
        topoJson: germanyOneToOneConstituenciesTilegram,
        geography: 'Germany - Constituencies',
      },
      {
        label: 'Brazil States Population 2017',
        topoJson: brazilStatesPopulation2018,
        geography: 'Brazil',
      },
      {
        label: 'United Kingdom - Regions',
        topoJson: ukRegions,
        geography: 'United Kingdom - Regions',
      },
      {
        label: 'India Constituencies',
        topoJson: indiaConstituencies,
        geography: 'India',
      },
    ]
  }

  getLabels() {
    return this._tilegrams.map(tilegram => tilegram.label)
  }

  getTilegram(geography, index) {
    const tilegram = this.getTilegramsByGeography(geography)[index]
    return tilegram ? tilegram.topoJson : undefined
  }

  getTilegramsByGeography(geography) {
    return this._tilegrams.filter(tilegram => tilegram.geography === geography)
  }
}

export default new TilegramResource()
