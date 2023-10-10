/* eslint-disable no-undef */
const defaultZoom = 17
const iconScale = 0.5
const nearRadius = 0.001

// const testCoordinates = { coords: { latitude: 55.833954, longitude: -4.263546, accuracy: 20 } }

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

var interval
var currentAutoMove = false
var pauseAutoMove = false
var lastLocation = {
    latitude: 55.856,
    longitude: -4.259,
}

const points = []
const found = {}

let userPoint
let userCircle
let map
let bfoot

let nearPoints = []
// let hasRendered = false
let lastWasFail = false
// let userZoom = false

const profileToggle = document.querySelector('.profile .toggle')
const profileMenu = document.querySelector('.profile .dropdown')
const leaderBoardToggle = profileMenu.querySelector('.leader-board-option')
const instructionsToggle = document.querySelector('.instructions-option')
const instructions = document.querySelector('.instructions')
const loading = document.querySelector('.loading')

profileToggle.onclick = () => profileMenu.classList.toggle('hidden')

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)]

const openLeaderBoard = () => {
    const leaderBoard = document.querySelector('.leader-board')
    const leaderBoardList = leaderBoard.querySelector('.leader-board__list')
    fetch('/user/top-ten', {
        method: 'GET',
        header: {
            'Content-Type': 'application/json'
        },
        includeCredentials: true,
    })
        .then(res => res.json())
        .then(res => {
            const tbody = leaderBoardList.querySelector('tbody')
            tbody.innerHTML = ''
            res.data.forEach((datum, idx) => {
                const row = document.createElement('tr')
                const position = document.createElement('td')
                const username = document.createElement('td')
                const userScore = document.createElement('td')
                position.textContent = idx
                username.textContent = datum.username
                userScore.textContent = datum.score
                row.appendChild(position)
                row.appendChild(username)
                row.appendChild(userScore)
                console.log(leaderBoardList)
                tbody.appendChild(row)
            })
            leaderBoard.classList.remove('hidden')
        })
}

leaderBoardToggle.onclick = openLeaderBoard
instructionsToggle.onclick = () => instructions.classList.remove('hidden')

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

    map = L.map('map', { zoomSnap: 0 })
        .setView(
            [targetCenterCoords.lat, targetCenterCoords.lon],
            defaultZoom,
        )
    
    // const map = L.map('map').setView([39.50, -98.35], 4)
    // const map = L.map('map').setView([bfoot[0].latitude, bfoot[0].longitude], 3)
    // const map = L.map('map').setView([51.505, -0.09], 13)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)
    loading.classList.add('hidden')
    
    // ========== Test / demo markers ==========
    // const marker = L.marker([51.5, -0.09]).addTo(map)
    
    // const circle = L.circle([51.508, -0.11], {
    //     color: 'red',
    //     fillColor: '#f03',
    //     fillOpacity: .5,
    //     radius: 500,
    // }).addTo(map)
    
    // const polygon = L.polygon([
    //     [51.509, -0.08],
    //     [51.503, -0.06],
    //     [51.51, -0.047],
    // ]).addTo(map)
    
    // marker.bindPopup('<b>Hello World</b><br /><p>I am a popup</p>')
    // circle.bindPopup('I am a circle')
    // polygon.bindPopup('I am a polygon')
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

    map.on('movestart', () => {
        if (!currentAutoMove) {
            const centerPlayer = document.querySelector('.center-player')
            // centerPlayer.textContent = 'center = false'
            centerPlayer.classList.remove('active')
            pauseAutoMove = true
        }
    })

    L.DomEvent.on(document.querySelector('.center-player'), 'click', function (e) {
        e.stopPropagation()
        map.dragging.disable()
        const cp = document.querySelector('.center-player')

        currentAutoMove = true
        cp.classList.add('active')
        map.panTo([lastLocation.latitude, lastLocation.longitude])
        map.setZoom(17)
        map.dragging.enable()
        navigator.geolocation.getCurrentPosition((position) => {
            // position = testCoordinates
            lastLocation.latitude = position.coords.latitude
            lastLocation.longitude = position.coords.longitude
            pauseAutoMove = false
            map.panTo([position.coords.latitude, position.coords.longitude])
        })
    })

    if (next) {
        next()
    }
    // hasRendered = true
}

/**
 * Searches for all points within a radius of a given set of coordinates.
 *
 * The return value is a list of indexes of all the points within this radius.
 *
 * Used for the logic to display sighting markers.
 * @param {{ latitude: number, longitude: number }} coords The coordinates to search around.
 * @param {BigfootDatum[]} _points 
 * @returns {number[]}
 */
const findNearPoints = (coords, _points) => {
    const indexes = []
    // NOTE: There is a bug which results in searching in a longitudinal oval shape around the user. Needs investigation to fix but is not a big deal.
    // TODO: Rudimentary logic performs a complete search; to be replaced with a quad-tree.
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
    lastLocation.latitude = position.coords.latitude
    lastLocation.longitude = position.coords.longitude

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

    // commented code describes ability to use direction marker.
    // left in until bugs can be remedied.
    // leaflet overrides the rotate-center point causing issues rotating the sprite
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
    
    // NOTE: logic to implement directional user icon.
    // const user = document.querySelector('.user-icon')
    // console.log(user.style)
    // if (user) {
    //     console.log(user.style.transform)
    //     user.style.transform += 'rotate(132deg)'
    //     console.log(user.style.transform)
    // }

    // If the user does not have manual control of the view, update the window to follow them.
    if (!pauseAutoMove) {
        currentAutoMove = true
        map.panTo([position.coords.latitude, position.coords.longitude])
        currentAutoMove = false
    }
    
    // Update the near points list for the user's new location.
    nearPoints = findNearPoints(position.coords, points)
    points.forEach((_point, idx) => {
        const nearPoint = points[idx]
        const isActive = nearPoint.isActive
        // Add the near points to the map and remove any that are still active.
        if (nearPoints.includes(idx)) {
            nearPoint.marker.addTo(map)
            nearPoint.isActive = true
        } else if (isActive) {
            nearPoint.marker.remove()
            nearPoint.isActive = false
        }
    })
}

function gameLoop () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            // position = testCoordinates
            drawUser({ ...position, coords: {
                ...position.coords,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy || 1,
            } })
        })
    } else {
        clearInterval(interval)
        alert('You must enable location sharing for Bigfoot Go to work')
    }
}

navigator.geolocation.getCurrentPosition((position) => {
    // position = testCoordinates
    render({ lat: position.coords.latitude, lon: position.coords.longitude })
    interval = setInterval(gameLoop, 5000)
}, () => {
    alert('You must enable location sharing for Bigfoot Go to work')
})

function noLoop () {
    clearInterval(interval)
}

// document.querySelector('.score-wrapper').onclick = () => {
//     console.log('??')
//     const profileScore = document.querySelector('.sightings')
//     const plusOne = document.querySelector('.plus-one')
//     profileScore.innerHTML = Math.floor(Math.random() * 100)
//     plusOne?.classList.add('show')
//     setTimeout(() => plusOne?.classList.remove('show'), 5000)
// }

function startEncounter (idx) {
    if (idx in found) {
        return
    }
    noLoop()
    const popup = document.querySelector('#popup')
    const plusOne = document.querySelector('.plus-one')

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

    title.style.transform = `rotate(${
        Math.floor(Math.random() * 2) * (titleNeg ? -1 : 1)
    }deg) translate(${titleNeg ? '-5vw' : '    5vw'})`

    const resetImgs = () => {
        actualWrapper.classList.add('hidden')
        dannyWrapper.classList.add('hidden')
    }

    /**
     * Resets the gameplay and the default state of the modal.
     *
     * - Game loop is re-initialised
     * - All points within the detectable radius are marked as 'found'. This stops a user getting multiple encounters in the same spot.
     * - Items hidden and title set back to default.
     */
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

    /**
     * Handles a failed encounter, i.e. one in which the user takes a photograph but the image is invalid.
     *
     * - Choses a random fail-title to inform the user it got away.
     * - Choses a random 'fail' caption for the close button.
     * - Picks a random 'sighted' image.
     * - Sets a time to auto-close the modal and call {@link resetTitle} if they are idle.
     */
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

    /**
     * A second 'fail' conditional. Handles a response for inaction on the user's part.
     *
     * The gameplay describes the alleged encounter getting away, that the user was 'too slow'.
     *
     * Unlike {@link fail} this modal will not self-close as the user may be AFK.
     * - Displays the 'too slow' title.
     * - Removes the image from view.
     * - Choses a random 'fail' caption for the close button.
     */
    const tooSlow = () => {
        resetImgs()
        title.innerHTML = 'Ah, too slow! Whatever it was has ran away.'
        bush.classList.add('hidden')
        close.innerHTML = `"${pickRandom(closeButtonMessages)}" (close)`
        setTimeout(() => {
            close.classList.remove('hidden')
            success.classList.add('hidden')
            camera.classList.add('hidden')
        }, 100)
        close.onclick = resetTitle
    }

    /**
     * A last 'fail' conditional, used in place of {@link fail} in some instances.
     *
     * The gameplay describes encountering Danny Divito hiding out in the bushes for reasons unknown.
     *
     * Functions the same as {@link fail}.
     *
     * - Choses a random danny-title to inform the user it is their friend (enemy?) Danny Divito.
     * - Choses a random 'danny' caption for the close button; the user's apparent reaction to this.
     * - Picks a random 'danny' image.
     * - Sets a time to auto-close the modal and call {@link resetTitle} if they are idle.
     */
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

    // Set a random time limit before displaying the 'too slow' pathway. Time is between 15 and 25 seconds.
    let timeFail = setTimeout(tooSlow, Math.random() * 10_000 + 15_000)

    /**
     * Main gameplay logic.
     *
     * The user clicking the camera instigates a series of events to conclude the encounter.
     */
    camera.onclick = () => {
        // Disable the idle timeout as the user has acted.
        clearInterval(timeFail)

        // The 'flash' class is used to emulate the flash of a camera. All events follow its removal.
        popup.classList.add('flash')
        setTimeout(() => {
            popup.classList.remove('flash')
    
            // Hide the bush animation.
            bush.classList.add('hidden')
    
            // User has a 2-in-3 chance to succeed. If the user has just failed then they will automatically succeed (to avoid frustration).
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
                    plusOne?.classList.add('show')
                    setTimeout(() => plusOne?.classList.remove('show'), 5000)
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
// startEncounter()

// Bind event handlers for the modal close functionality (open functionality is handled individually)
document.querySelectorAll('.modal').forEach(modal => {
    modal.onclick = function (e) {
        const inner = this.querySelector('.modal-inner')
        if (!inner?.contains(e.target)) {
            this.classList.add('hidden')
        }
    }
})

document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.onclick = function (e) {
        e.target.closest('.modal').classList.add('hidden')
    } 
})