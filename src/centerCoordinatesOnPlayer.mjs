import './types.mjs';

/**
 * Transforms and scales the Bigfoot dataset to a scale and position desired.
 * @param {BigfootDatum[]} data The raw Bigfoot data.
 * @param {{ lat: number, lon: number }} sourceCenterCoords The coordinates of the original center of the data points.
 * @param {{ lat: number, lon: number }} targetCenterCoords Target coordinates to place the new center on.
 * @param {number} scale Radius in kilometres to scale the points down to.
 * @returns {BigfootDatum[]}
 */
const centerCoordinatesOnPlayer = (
    data = [],
    sourceCenterCoords = { lat: 39.50, lon: -98.35, },
    targetCenterCoords = { lat: 0, lon: 0 },
    scale = 1
) => {
    // Find the magnitude difference between the center points
    const latDifference = sourceCenterCoords.lat - targetCenterCoords.lat
    const lonDifference = sourceCenterCoords.lon - targetCenterCoords.lon
    const convertedData = data.map((datum, idx) => {
        // Minus this magnitude difference from each of the data points to transform them to their new position.
        const latTransformed = datum.latitude - latDifference
        const lonTransformed = datum.longitude - lonDifference

        const latMagnitude = latTransformed - targetCenterCoords.lat
        const lonMagnitude = lonTransformed - targetCenterCoords.lon

        const latDivider = scale / 2250
        const lonDivider = scale / 950

        const latScaled = targetCenterCoords.lat + latMagnitude * latDivider
        const lonScaled = targetCenterCoords.lon + lonMagnitude * lonDivider
        return {
            ...datum,
            latitude: Number((latScaled).toFixed(5)),
            longitude: Number((lonScaled).toFixed(5)),
            // latitude: Number((latTransformed).toFixed(5)),
            // longitude: Number((lonTransformed).toFixed(5)),
        }
    })
    return convertedData
}

export default centerCoordinatesOnPlayer
