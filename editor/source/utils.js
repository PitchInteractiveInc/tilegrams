/** Return a pseudo-random color for a given fips code */
function fipsColor(fips) {
  return `hsl(${parseInt(fips) * 300 % 25.5 * 10.0}, 80%, 60%)`
}

/** Create DOM element */
function createElement() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

/** Updated memoized bounds if exceeded by bounds */
function updateBounds(memoBounds, bounds) {
  for (let lim = 0; lim < 2; lim++) {       // limit (0 = min; 1 = max)
    for (let dim = 0; dim < 2; dim++) {     // dimension (0 = x; 1 = y)
      memoBounds[lim][dim] =
        Math[lim == 0 ? 'min' : 'max'](memoBounds[lim][dim], bounds[lim][dim])
    }
  }
}

/** Check if point is within corner bounds (of format [[0, 0], [100, 100]]) */
function checkWithinBounds(point, bounds) {
  for (let lim = 0; lim < 2; lim++) {       // limit (0 = min; 1 = max)
    for (let dim = 0; dim < 2; dim++) {     // dimension (0 = x; 1 = y)
      if (lim == 0 && point[dim] < bounds[lim][dim]) {
        return false
      } else if (lim == 1 && point[dim] > bounds[lim][dim]) {
        return false
      }
    }
  }
  return true
}

module.exports = {
  fipsColor,
  createElement,
  updateBounds,
  checkWithinBounds
}
