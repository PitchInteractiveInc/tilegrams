# Hexagon Cartogram Maker

The Maker is a Node.js front-end app for editing GeoJSON composed of hexagons.

## Development

### Setup

After cloning the repository, run:

    npm i

Since [`topogram`](https://github.com/shawnbot/topogram)
has not yet been published to `npm`, you'll need to clone it and check out the
[`node-js`](https://github.com/shawnbot/topogram/tree/node-js) branch, and
update the local path in `package.json`.

### Running

Run

    npm start

Then access `http://localhost:8080/`.

### Deploying

To generate deployable assets, run:

    npm run build

They will be written to `dist/`.

## Dependencies

JavaScript is written in [ES2015](https://babeljs.io/docs/learn-es2015/)
using [Babel](https://babeljs.io/). Styles are written in
[SASS](http://sass-lang.com/). All assets are preprocessed with
[webpack](https://webpack.github.io/).

The Maker also depends on a pre-release `npm` version of `topogram`
(formerly `cartogram.js`) as seen in
[this PR](https://github.com/shawnbot/topogram/pull/26).

## Data Sources
[Population Data](http://factfinder.census.gov/faces/tableservices/jsf/pages/productview.xhtml?pid=PEP_2015_PEPANNRES&prodType=table)
[Electoral Votes Data](https://www.archives.gov/federal-register/electoral-college/allocation.html)
[GDP Data](http://www.bea.gov/newsreleases/regional/gdp_state/qgsp_newsrelease.htm)

# License

This software is distributed under the [ISC](https://spdx.org/licenses/ISC.html)
license.
