// import * as _ from 'lodash'
// import * as L from 'leaflet'

import bfoot from '../bfoot.json'

// console.log('-=-=-=-=-=-=-=-=-')
// console.log(_)
// console.log('-=-=-=-=-=-=-=-=-')

const map = L.map('map').setView([39.50, -98.35], 4)
// const map = L.map('map').setView([bfoot[0].latitude, bfoot[0].longitude], 2)
// const map = L.map('map').setView([51.505, -0.09], 13)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

const marker = L.marker([51.5, -0.09]).addTo(map)

const circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: .5,
    radius: 500,
}).addTo(map)

const polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047],
]).addTo(map)

marker.bindPopup('<b>Hello World</b><br /><p>I am a popup</p>')
circle.bindPopup('I am a circle')
polygon.bindPopup('I am a polygon')

console.log(bfoot)
bfoot.forEach(datum => {
    const mark = L.marker([datum.latitude, datum.longitude]).addTo(map)
    mark.bindPopup(`<b>${datum.classification} - ${datum.timestamp}</b><br /><p>${datum.title}</p>`)
})
