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
let lastWasFail = false

const titleMessagesSuccess = ['Success! You send the photo the local paper']

const titleMessagesFail = ['Oh no! They got away!']

const titleMessagesDanny = [
    'Oh never mind, its just danny'
]

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

const dannyCloseMessages = [
    'Oh hi danny',
    'Danny Divito!? I\'m a big fan!',
    'I\'m going to chase you out of town',
    'What are you doing in my geraniums',
    'I thought it was you',
    'Basically a cryptid anyway...',
    'Congratulations on the SAG-AFTRA strike Danny',
    'This always happens',
]

const bfootCaptured = [
    'bfoot-chill.jpeg',
    'bfoot-family-guy.jpeg',
    'bfoot-friendly.png',
    'bfoot-guy.jpeg',
    'bfoot-sprite.png',
    'bfoot-stoned.jpeg',
    'bfoot-vector.png',
]

const bfootSighted = [
    'bfoot-sky.jpeg',
    'bfoot-treeline.jpeg',
    'bfoot-thumb.jpg',
    'bfoot-woops.jpg',
]

const bfootDanny = [
    'danny.jpeg',
    'egg.jpg',
    'laugh.jpg',
    'peace.jpg',
    'void.jpg',
    'wig.jpg',
]

const profileToggle = document.querySelector('.profile .toggle')
const profileMenu = document.querySelector('.profile .dropdown')

profileToggle.onclick = () => profileMenu.classList.toggle('hidden')

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]

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
                    iconUrl: './src/imgs/ui/icon-bush.gif',
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
    if (!map) {
        return
    }
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
                        iconUrl: './src/imgs/ui/icon-location.png',
                        shadowUrl: '',
                        iconSize: [40 * iconScale, 40 * iconScale],
                        className: 'user-icon',
                    })
                    // ? L.icon({
                    //     iconUrl: './src/icon-location-heading.png',
                    //     shadowUrl: '',
                    //     iconSize: [64 * iconScale, 130 * iconScale],
                    //     className: 'user-icon',
                    // })
                    : L.icon({
                        iconUrl: './src/imgs/ui/icon-location.png',
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
    navigator.geolocation.getCurrentPosition((position) => {
        render(
            { lat: position.coords.latitude, lon: position.coords.longitude },
            () => drawUser(position)
            // { lat: 57.197332, lon: -3.822182 },
            // () => drawUser({ coords: { latitude: 57.197332, longitude: -3.822182, accuracy: 5, heading: 0 } })
        )
    })
} else {
    render()
    alert('You need to enable location for Bigfoot Go to work.')
}

// let xInc = 0
// let yInc = 0

const gameLoop = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log('rerender')
        // console.log(position)
        // console.log(position.coords, {
        //     ...position.coords,
        //     latitude: position.coords.latitude,// + (yInc / 10000),
        //     longitude: position.coords.longitude, // + (xInc / 10000),
        //     accuracy: position.coords.accuracy || 2,
        // })
        drawUser({ ...position, coords: {
            ...position.coords,
            latitude: position.coords.latitude, // + (yInc / 10000),
            longitude: position.coords.longitude, // + (xInc / 10000),
            accuracy: position.coords.accuracy || 2,
        } })
        // xInc++
    })
    // yInc++
    // const position = { coords: { latitude: 57.197332, longitude: -3.820735, accuracy: 5, heading: 0 } }
}

let interval = setInterval(gameLoop, 1000)

const noLoop = () => clearInterval(interval)

function startEncounter (idx) {
    // console.log({ idx, found, nearPoints })
    if (idx in found) {
        return
    }
    // console.log('ENCOUNTER')
    noLoop()
    const popup = document.querySelector('#popup')

    const title = popup.querySelector('.title')
    const bush = popup.querySelector('.bfoot.bush')
    const actual = popup.querySelector('.bfoot.actual')
    const actualWrapper = actual.closest('.polaroid')
    const danny = popup.querySelector('.bfoot.danny')
    const dannyWrapper = danny.closest('.polaroid')
    const camera = popup.querySelector('.camera')
    const close = popup.querySelector('.close')
    const success = popup.querySelector('.success')

    popup.classList.remove('hidden')
    const titleNeg = Math.floor(Math.random() * 2)
    title.style.transform = `rotate(${Math.floor(Math.random() * 2) * (titleNeg ? -1 : 1)}deg) translate(${titleNeg ? '-5vw' : '    5vw'})`

    const resetImgs = () => {
        actualWrapper.classList.add('hidden')
        dannyWrapper.classList.add('hidden')
    }

    const resetTitle = () => {
        title.innerHTML = 'Something is rustling ahead!'
        actualWrapper.classList.add('hidden')
        popup.classList.add('hidden')
        close.classList.add('hidden')
        bush.classList.remove('hidden')
        camera.classList.remove('hidden')
        actual.src = './src/imgs/bigfoot.jpg'
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
        title.innerHTML = pickRandom(titleMessagesFail)
        actual.src = `./src/imgs/bigfoot-sighted/${pickRandom(bfootSighted)}`
        actualWrapper.classList.remove('hidden')
        close.innerHTML = `"${pickRandom(closeButtonMessages)}" (close)`
        setTimeout(() => {
            close.classList.remove('hidden')
            success.classList.add('hidden')
            camera.classList.add('hidden')
        }, 100)
        close.onclick = resetTitle
        setTimeout(resetTitle, 10_000)
    }

    const dannySurprise = () => {
        resetImgs()
        title.innerHTML = pickRandom(titleMessagesDanny)
        danny.src = `./src/imgs/danny/${pickRandom(bfootDanny)}`
        dannyWrapper.classList.remove('hidden')
        close.innerHTML = `"${pickRandom(dannyCloseMessages)}" (close)`
        setTimeout(() => {
            close.classList.remove('hidden')
            success.classList.add('hidden')
            camera.classList.add('hidden')
        }, 100)
        close.onclick = resetTitle
        setTimeout(resetTitle, 10_000)
    }

    let timeFail = setTimeout(fail, Math.random() * 10_000 + 15_000)

    camera.onclick = () => {
        popup.classList.add('flash')
        setTimeout(() => {
            popup.classList.remove('flash')
            clearInterval(timeFail)
            bush.classList.add('hidden')
            const coinFlip = Math.floor(Math.random() * 3)
            if (coinFlip < 2 || lastWasFail) {
                lastWasFail = false
                title.innerHTML = pickRandom(titleMessagesSuccess)
                actualWrapper.classList.remove('hidden')
                actual.src = `./src/imgs/bigfoot-captured/${pickRandom(bfootCaptured)}`
                actualWrapper.style.transform = `rotate(${Math.floor(Math.random() * 8) * (Math.floor(Math.random() * 2) ? -1 : 1)}deg)`
                camera.classList.add('hidden')
                success.classList.remove('hidden')
                success.onclick = () => {
                    resetImgs()
                    resetTitle()
                }
                fetch('/user/score', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                })
                    .then(res => res.json())
                    .then(res => {
                        const profileScore = document.querySelector('.sightings')
                        if (res.status === 200) {
                            profileScore.innerHTML = res.data.score
                        }
                    })
            } else {
                lastWasFail = true
                const dannyCoinFlip = Math.floor(Math.random() * 6)
                if (dannyCoinFlip < 2) {
                    dannySurprise()
                } else {
                    fail()
                }
            }
        }, 500)
    }
}
startEncounter()