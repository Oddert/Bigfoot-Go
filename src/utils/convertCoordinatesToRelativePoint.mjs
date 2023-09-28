import centerCoordinatesOnPlayer from './centerCoordinatesOnPlayer.mjs'

import { readFileSync, writeFileSync } from 'fs'

const outPath = './data/bfootConverted.json'
const sourceCenterCoords = {
    lat: 39.50,
    lon: -98.35,
}
const targetCenterCoords = {
    lat: 55.856,
    lon: -4.259,
}

const rawData = readFileSync('./data/bfoot.json')
const data = JSON.parse(rawData)

const convertedData = centerCoordinatesOnPlayer(data, sourceCenterCoords, targetCenterCoords)
console.log(data[0], convertedData[0])

try {
    writeFileSync(outPath, JSON.stringify(convertedData, null, 2), 'utf8')
    console.log('Data successfully saved to disk')
} catch (error) {
    console.log('An error has occurred ', error)
}
