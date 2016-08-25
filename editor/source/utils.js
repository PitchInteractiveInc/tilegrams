/** Return a pseudo-random color for a given fips code */
function fipsColor(fips) {
  return `hsl(${parseInt(fips) * 300 % 25.5 * 10.0}, 80%, 60%)`
}

function createElement() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

module.exports = {
  fipsColor,
  createElement,
}
