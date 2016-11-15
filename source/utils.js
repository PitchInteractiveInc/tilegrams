import fipsHash from '../data/fips-to-state.json'

/** Return a pseudo-random color for a given fips code */
function fipsColor(fips) {
  let number = parseInt(fips, 10)
  if (isNaN(number)) {
    number = fips.charCodeAt(0) - 97 || 0 // TODO: better conversion of string to color
  }
  const scalar = number / 56.0
  return `hsl(${360 - ((scalar * 180.0) + 180.0)}, 85%, 70%)`
}

/** Create DOM element. Options may include 'id' */
function createElement(options) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  div.id = options.id
  return div
}

function startDownload({filename, content, mimeType}) {
  const link = document.createElement('a')
  document.body.appendChild(link)
  link.setAttribute('href', `data:${mimeType},${content}`)
  link.setAttribute('download', filename)
  link.click()
  document.body.removeChild(link)
}

/** Update memoized bounds if exceeded by bounds */
function updateBounds(memoBounds, bounds) {
  for (let lim = 0; lim < 2; lim++) {       // limit (0 = min; 1 = max)
    for (let dim = 0; dim < 2; dim++) {     // dimension (0 = x; 1 = y)
      memoBounds[lim][dim] =
        Math[lim === 0 ? 'min' : 'max'](memoBounds[lim][dim], bounds[lim][dim])
    }
  }
}

/** Check if point is within corner bounds (of format [[0, 0], [100, 100]]) */
function checkWithinBounds(point, bounds) {
  for (let lim = 0; lim < 2; lim++) {       // limit (0 = min; 1 = max)
    for (let dim = 0; dim < 2; dim++) {     // dimension (0 = x; 1 = y)
      if (lim === 0 && point[dim] < bounds[lim][dim]) {
        return false
      } else if (lim === 1 && point[dim] > bounds[lim][dim]) {
        return false
      }
    }
  }
  return true
}

/** Convert array of key,value objects (eg: [{key: 0, value: 0}]) to hash for quick lookup */
function hashFromData(data) {
  const dataHash = {}
  data.forEach((datum) => {
    dataHash[datum.key] = datum.value
  })
  return dataHash
}

function fipsToPostal(fips) {
  return fipsHash[fips] ? fipsHash[fips].postal : fips
}

function checkDevEnvironment() {
  const devPort = 8080 // should match whatever port webpack-dev-server is running on
  return parseInt(document.location.port, 10) === devPort
}
const _isDevEnvironment = checkDevEnvironment() // eslint-disable-line no-underscore-dangle

function isDevEnvironment() {
  return _isDevEnvironment
}

module.exports = {
  fipsColor,
  createElement,
  startDownload,
  updateBounds,
  checkWithinBounds,
  hashFromData,
  fipsToPostal,
  isDevEnvironment,
}
