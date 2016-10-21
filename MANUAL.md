# Making a Tilegram

A “tilegram” is a map made of tiles
where regions are sized proportionally to a dataset.
The name is short for a tiled
[cartogram](https://en.wikipedia.org/wiki/Cartogram).
Tilegrams can represent demographic data more truthfully than conventional,
geographic maps, while still retaining a familiar appearance.

This free, open-source tool enables news designers and developers
to browse existing tilegrams or make their own for use in interactive
and print publications.

Even with computer automation, tilegrams can be time-consuming to produce,
because, to be effective, they require a human eye to verify that geographic
contours will be recognizable and meaningful to a general readership. For this
reason, you're encouraged to begin with existing tilegrams before authoring
your own.

You can read more about the project in our announcement
[blog post](http://pitchinteractive.com/latest/tilegrams-more-human-maps/).

This manual proceeds from the most basic to the most advanced usage case.

## Exporting existing tilegrams

On load, you will see a ready-made tilegram, as selected in the
**Load existing** menu. Try selecting other options to browse around.

If you are satisfied with the tilegram as it appears, go right ahead and
**Export**—as **TopoJSON** or **SVG**—using the buttons at the lower left.

Designers will be able to import the SVG into their software of choice
(e.g. Illustrator) and developers will be able to pull the TopoJSON into
web applications. In both cases, the data is identified with the US
[FIPS](https://en.wikipedia.org/wiki/Federal_Information_Processing_Standards)
code.

## Editing tilegrams

Suppose you've loaded a tilegram, but want to reshape a region. Maybe Florida
looks too heavy, or Missouri is streched too thin.

Click step **2**: **Refine your tilegram**.

### Moving tiles around

Click and drag any tile to move it around.

To move many tiles around, click and drag a
rectangular marquee around them, and then drag them around.

To move just a specific region around, double-click
any tile in it to select them all—then drag them around.

You can also hover over a region in the **State Tiles**
sidebar area to see that region's tiles highlighted on the map.

### Ensuring statistical accuracy

Under **State Tiles**, you'll see a list of each state with a number and a
hexagon.

The number indicates the _delta inaccuracy_ between the number of tiles that
region _currently_ has on the map and how many it _should_ have, based on the
dataset. If the delta is positive, that region has too many tiles on the map.
If the delta is negative, it doesn't have enough tiles on the map. If there
If there is a warning sign, then that region doesn't have enough data for even a
single tile on the map at the chosen resolution.

(_Why does this happen?_ It is computationally very difficult to produce
tilegrams which are accurate _and_ recognizable. As you begin to make
cartograms, you'll appreciate the difficult trade-offs you must make between
preserving the approximate shapes of regions and their adjacency to other
regions.)

To remove a tile from the map, click it, and hit 'Delete' on your keyboard.

To add a tile to the map, click the hexagon from the left sidebar and drag it
onto the map.

## Generating new tilegrams

If you've made it this far, you are ready to produce your own tilegram.

Select **Generate from data**. You will see the tilegram generated before your
eyes, by beginning with a conventional geographic map and then progressively
resizing its regions to conform to the selected dataset.

Under **Dataset**, you may select one of a few prepared datasets, or input
your own **Custom CSV**, by pasting in a dataset in the format specified,
using US FIPS codes.

Then you may alter the resolution in two ways. The most visually gratifying is
to click and grab the **Resolution** slider and watch as the tiles are
re-computed in realtime. The other, more statistically accurate way is to click
into the **Per tile** field and entire your desired value per tile.

For example, if you are using population to scale the regions of your tilegram,
you might enter '500,000' so that each tile corresponds to (approximately) five
hundred thousand people. Then, each region's number of tiles is rounded to the
nearest multiple of that number. So, in this same example, if you have a region
with 700,000 people, the metrics would show that you need one tile and if you
have a region with 800,000 people it would round up to two tiles.

As you adjust the **Dataset** and **Resolution**/**Per tile**, you'll notice
that the _deltas_ under **State Tiles** update dynamically. Please remember
to take note of them and ensure that they all read `0` to make responsible
tilegrams.

## Using exported tilegrams

### In D3

You can export either SVG or TopoJSON for use in [D3](https://d3js.org/).

The following examples use D3 v4 and were tested against this hosted version:

```html
<script type="text/javascript" src="https://d3js.org/d3.v4.min.js"></script>
```

#### Rendering tilegram SVG in D3

The simplest D3 integration may just be to write the SVG to the DOM and then
add handlers for interactivity:

```javascript
var WIDTH = 800

d3.text('tiles.svg', (e, data) => {
  var div = d3.select(document.body).append('div').html(data)
  var svg = div.select('svg')
  var groups = svg.selectAll('g')

  // Scale SVG
  var importedWidth = parseInt(svg.attr('width'))
  var importedHeight = parseInt(svg.attr('height'))
  var scale = WIDTH / importedWidth
  svg
    .attr('width', importedWidth * scale)
    .attr('height', importedHeight * scale)
  groups.attr('transform', 'scale(' + scale + ')')

  // Apply handlers
  groups.on('click', (e) => {
    console.log('Clicked', d3.event.target.parentNode.id)
  })
})
```

#### Rendering tilegram TopoJSON in D3

When displaying tilegrams TopoJSON in D3, it's important not to use a geographic
projection, as the TopoJSON coordinates do not refer to latitude/longitude,
but to dimensionless Euclidean space.

It is currently also necessary to flip the map vertically. (This is
because the exported tilegram coordinates assume that the origin (`0, 0`) is in
the lower-left corner, whereas projection-less rendering will assume that it's
in the upper-left.) Note the `transform` below.

First, be sure to import `topojson` as well:

```html
<script type="text/javascript" src="http://d3js.org/topojson.v1.min.js"></script>
```

Then:

```javascript
var WIDTH = 1400
var HEIGHT = 1000

var svg = d3.select('body').append('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)

d3.json('tiles.topo.json', function showData(error, tilegram) {
  var tiles = topojson.feature(tilegram, tilegram.objects.tiles)

  var transform = d3.geoTransform({
    point: function(x, y) {
      this.stream.point(x, -y)
    }
  })

  var path = d3.geoPath().projection(transform)

  var g = svg.append('g')
    .attr('transform', 'translate(0,' + HEIGHT + ')')

  g.selectAll('.tiles')
    .data(tiles.features)
    .enter().append('path')
    .attr('d', path)
})
```

To draw a border around each state:

```javascript
// Build list of state codes
var stateCodes = []
tilegram.objects.tiles.geometries.forEach(function(geometry) {
  if (stateCodes.indexOf(geometry.properties.state) === -1) {
    stateCodes.push(geometry.properties.state)
  }
})

// Build merged geometry for each state
var stateBorders = stateCodes.map(function(code) {
  return topojson.merge(
    tilegram,
    tilegram.objects.tiles.geometries.filter(function(geometry) {
      return geometry.properties.state === code
    })
  )
})

// Draw path
g.selectAll('path.border')
  .data(stateBorders)
  .enter().append('path')
  .attr('d', path)
  .attr('class', 'border')
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('stroke-width', 4)
```

## Sharing tilegrams

If you use, enjoy, or can't stand this tool, we'd love to hear from you at
[@pitchinc](http://twitter.com/pitchinc) or
[info@pitchinteractive.com](mailto:info@pitchinteractive.com).
We hope to include more example tilegrams in the application.

Happy tilegramming!
