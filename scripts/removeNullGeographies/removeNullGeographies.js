const fs = require('fs')
const path = require('path')

const inputDirectory = '/Users/pitchmini/Downloads/states-orig/'
const outputDirectory = './out/'
const files = fs.readdirSync(inputDirectory)

console.log(files)

function nextFile() {
  if (files.length === 0) {
    return done();
  }
  const file = files.pop()
  const fullPath = path.join(inputDirectory, file)
  console.log(fullPath)
  const contents = JSON.parse(fs.readFileSync(fullPath).toString())
  contents.objects.tiles.geometries = contents.objects.tiles.geometries.filter(g => {
    return g.type != null
  })
  console.log(contents.objects.tiles.geometries)
  const outputPath = path.join(outputDirectory, file)
  fs.writeFileSync(outputPath, JSON.stringify(contents))
  setImmediate(nextFile)
}


function done() {
  console.log('ok')
}

nextFile()