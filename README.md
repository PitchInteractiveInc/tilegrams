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
