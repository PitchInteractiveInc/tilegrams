/** Return a pseudo-random color for a given geo code */
function fipsColor(fips) {
  const scaleTo = 56
  let number = parseInt(fips, 10) % scaleTo
  if (isNaN(number)) {
    number = (
      ((fips.charCodeAt(fips.length - 1) || 0) + ((fips.charCodeAt(fips.length - 2) || 0) * 10))
    ) % scaleTo
  }
  const scalar = number / scaleTo
  return `hsl(${360 - ((scalar * 180.0) + 180.0)}, 87%, 70%)`
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
  isDevEnvironment,
}
