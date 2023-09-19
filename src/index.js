/* eslint-disable no-undef */
const defaultZoom = 17
const iconScale = 0.5
const nearRadius = 0.001

const points = []
let nearPoints = []

const found = {}

let userPoint
let userCircle
let map
let bfoot

const closeButtonMessages = [
    'My grief is inconsolable',
    'I will do better next time',
    'I didn\'t really want that pic anyway',
    'ok',
    'This game sucks',
    'Probably a fake anyway',
    ':(',
    'Victory will yet be mine',
    'Continue the search...',
]

const render = async (
    targetCenterCoords = {
        lat: 55.856,
        lon: -4.259,
    },
    next,
) => {
    const res = await fetch(`/bfoot?lat=${targetCenterCoords.lat}&lon=${targetCenterCoords.lon}`, {
        headers: {
            'Content-Type': 'application/json',
        }
    })

    const response = await res.json()
    
    bfoot = response.data

    map = L.map('map').setView([targetCenterCoords.lat, targetCenterCoords.lon], defaultZoom)
    
    // const map = L.map('map').setView([39.50, -98.35], 4)
    // const map = L.map('map').setView([bfoot[0].latitude, bfoot[0].longitude], 3)
    // const map = L.map('map').setView([51.505, -0.09], 13)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)
    
    // ========== Test / demo markers ==========
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
    // ========== end Test / demo markers ==========
    
    bfoot.forEach((datum, idx) => {
        const mark = L.marker(
            [datum.latitude, datum.longitude],
            {
                icon: L.icon({
                    iconUrl: 'http://localhost:3000/src/icon-bush.gif',
                    iconSize: [50, 23.5],
                })
            })
        mark.bindPopup(
            `<b>${datum.classification} - ${datum.timestamp}</b>
            <br />
            <p>${datum.title}</p>`
        )
        mark.on('click', () => startEncounter(idx))
        points.push({
            marker: mark,
            isActive: false,
        })
    })
    if (next) {
        next()
    }
}

const findNearPoints = (coords, _points) => {
    const indexes = []
    _points?.forEach((point, idx) => {
        const latLon = point?.marker?.getLatLng()
        if (!latLon) {
            return
        }
        const ux = coords.longitude
        const uy = coords.latitude
        const px = latLon.lng
        const py = latLon.lat
        const diffX = Math.round((px - ux) * 10000000)
        const diffY = Math.round((py - uy) * 10000000)
        const radiusDistance = Math.sqrt(diffX * diffX + diffY * diffY)
        if (radiusDistance <= nearRadius * 10000000) {
            indexes.push(idx)
        }
    })
    return indexes
}

const drawUser = (position) => {
    const userCoords = [position.coords.latitude, position.coords.longitude]

    if (!userCircle) {
        userCircle = L.circle(
            userCoords,
            {
                color: '#04FFFF',
                fillColor: '#04FFFF',
                fillOpacity: .2,
                radius: position.coords.accuracy,
            }
        ).addTo(map)
    } else {
        userCircle.setLatLng(userCoords)
    }

    if (!userPoint) {
        userPoint = L.marker(
            userCoords,
            {
                icon: position.coords.heading
                    ? L.icon({
                        iconUrl: 'http://localhost:3000/src/icon-location.png',
                        shadowUrl: '',
                        iconSize: [40 * iconScale, 40 * iconScale],
                        className: 'user-icon',
                    })
                    // ? L.icon({
                    //     iconUrl: 'http://localhost:3000/src/icon-location-heading.png',
                    //     shadowUrl: '',
                    //     iconSize: [64 * iconScale, 130 * iconScale],
                    //     className: 'user-icon',
                    // })
                    : L.icon({
                        iconUrl: 'http://localhost:3000/src/icon-location.png',
                        shadowUrl: '',
                        iconSize: [40 * iconScale, 40 * iconScale],
                        className: 'user-icon',
                    })
            }
        ).addTo(map)
    } else {
        userPoint.setLatLng(userCoords)
    }
    
    // const user = document.querySelector('.user-icon')
    // console.log(user.style)
    // if (user) {
    //     console.log(user.style.transform)
    //     user.style.transform += 'rotate(132deg)'
    //     console.log(user.style.transform)
    // }
    map.setView([position.coords.latitude, position.coords.longitude])
    nearPoints = findNearPoints(position.coords, points)

    points.forEach((_point, idx) => {
        const nearPoint = points[idx]
        // const icon = nearPoint.marker.getIcon()
        const isActive = nearPoint.isActive
        if (nearPoints.includes(idx)) {
            nearPoint.marker.addTo(map)
            nearPoint.isActive = true
        } else if (isActive) {
            nearPoint.marker.remove()
            nearPoint.isActive = false
        }
    })
}

if (navigator.geolocation) {
    render(
        // { lat: position.coords.latitude, lon: position.coords.longitude },
        // () => drawUser(position)
        { lat: 57.197332, lon: -3.822182 },
        () => drawUser({ coords: { latitude: 57.197332, longitude: -3.822182, accuracy: 5, heading: 0 } })
    )
    // navigator.geolocation.getCurrentPosition((position) => {
    // })
} else {
    render()
    alert('You need to enable location for Bigfoot Go to work.')
}

let xInc = 0
// let yInc = 0

const gameLoop = () => {
    // navigator.geolocation.getCurrentPosition((position) => {
    //     // console.log('rerender', xInc, yInc)
    //     // console.log(position)
    //     // console.log(position.coords, {
    //     //     ...position.coords,
    //     //     latitude: position.coords.latitude,// + (yInc / 10000),
    //     //     longitude: position.coords.longitude + (xInc / 10000),
    //     //     accuracy: position.coords.accuracy || 2,
    //     // })
    //     // yInc++
    // })
    const position = { coords: { latitude: 57.197332, longitude: -3.820735, accuracy: 5, heading: 0 } }
    drawUser({ ...position, coords: {
        ...position.coords,
        latitude: position.coords.latitude,// + (yInc / 10000),
        longitude: position.coords.longitude + (xInc / 10000),
        accuracy: position.coords.accuracy || 2,
    } })
    xInc++
}

let interval = setInterval(gameLoop, 1000)

// eslint-disable-next-line no-unused-vars
const noLoop = () => clearInterval(interval)

function startEncounter (idx) {
    console.log({ idx, found, nearPoints })
    if (idx in found) {
        return
    }
    // stop the interval
    // show the game mechanic
    console.log('ENCOUNTER')
    noLoop()
    const popup = document.querySelector('#popup')
    const title = popup.querySelector('.title')
    const actual = popup.querySelector('.bfoot.actual')
    const danny = popup.querySelector('.bfoot.danny')
    const camera = popup.querySelector('.camera')
    const close = popup.querySelector('.close')
    const success = popup.querySelector('.success')

    popup.classList.remove('hidden')

    const resetImgs = () => {
        actual.classList.add('hidden')
        danny.classList.add('hidden')
    }

    const resetTitle = () => {
        title.innerHTML = 'A wild Bigfoot appears!'
        actual.classList.remove('hidden')
        popup.classList.add('hidden')
        close.classList.add('hidden')
        camera.classList.remove('hidden')
        actual.src = './src/bigfoot.jpg'
        interval = setInterval(gameLoop, 1000)
        nearPoints.forEach(pointIdx => {
            const nearPoint = points[pointIdx]
            nearPoint.marker.remove()
            nearPoint.isActive = false
            found[pointIdx] = true
        })
    }

    const fail = () => {
        resetImgs()
        title.innerHTML = 'Oh no! They got away!'
        actual.src = './src/bigfoot-fail.png'
        actual.classList.remove('hidden')
        close.classList.remove('hidden')
        success.classList.add('hidden')
        camera.classList.add('hidden')
        close.innerHTML = `${closeButtonMessages[Math.floor(Math.random() * closeButtonMessages.length)]} (close)`

        close.onclick = resetTitle
        setTimeout(resetTitle, 10_000)
    }

    let timeFail = setTimeout(fail, Math.random() * 10_000 + 15_000)
    camera.onclick = () => {
        clearInterval(timeFail)
        const coinFlip = Math.floor(Math.random() * 3)
        if (coinFlip < 2) {
            title.innerHTML = 'Success! You send the photo the local paper'
            actual.src = './src/bigfoot-captured.jpg'
            camera.classList.add('hidden')
            success.classList.remove('hidden')
            success.onclick = () => {
                resetImgs()
                resetTitle()
            }
        } else {
            fail()
        }
    }
}