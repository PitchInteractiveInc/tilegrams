# Hexagon Cartograms

One day, we got [really interested](https://twitter.com/pitchinc/status/765962981855199232)
in cartograms made from hexagons.

Now we've figured out how to make our own.

## Processing pipeline

Currently, we use [R](https://www.r-project.org/) to merge data into a shape
file, [ScapeToad](http://scapetoad.choros.ch/) to produce the cartogram,
[QGIS](http://www.qgis.org/) (and the [MMQGIS](http://michaelminn.com/linux/mmqgis/)
plugin) to apply the hexagon grid, and [`ogr2ogr`](http://www.gdal.org/ogr2ogr.html)
to convert to TopoJSON.

More information forthcoming.

## Editor

The Editor is a Node.js front-end app for editing GeoJSON composed of hexagons.

### Development

#### Setup

After cloning the repository, run:

    npm i

#### Running

Run

    npm start

Then access `http://localhost:8080/`.

#### Deploying

To generate deployable assets, run:

    npm run build

They will be written to `dist/`.

### Dependencies

JavaScript is written in [ES2015](https://babeljs.io/docs/learn-es2015/)
using [Babel](https://babeljs.io/). Styles are written in
[SASS](http://sass-lang.com/). All assets are preprocessed with
[webpack](https://webpack.github.io/).

## License

This software is distributed under the [ISC](https://spdx.org/licenses/ISC.html)
license.
