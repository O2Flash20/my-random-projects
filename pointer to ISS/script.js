async function getISSPosition() {
    try {
        // Send a fetch request to the given URL
        const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544")

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        // Parse the response body as JSON
        const data = await response.json()

        // Return the JSON data
        return { latitude: data.latitude, longitude: data.longitude, altitude: data.altitude }
    } catch (error) {
        // Handle any errors that occurred during the fetch or parsing
        console.error("Error fetching JSON data:", error)
        throw error
    }
}

async function getUserPosition() {
    // Return a new Promise
    return new Promise((resolve, reject) => {
        // Check if the browser supports the Geolocation API
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'))
        } else {
            // Request the user's position
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Successfully obtained the position, resolve the Promise with the position object
                    resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, altitude: position.coords.altitude | 0.1 }) //if can't get altitude, assume it's a bit above sea level (in kilometers)
                },
                (error) => {
                    // Handle any errors that occurred during the request
                    reject(error)
                }
            )
        }
    })
}

function rad(angleDeg) {
    return Math.PI / 180 * angleDeg
}

function deg(angleRad) {
    return 180 / Math.PI * angleRad
}

// +z is off the shore of africa, +x is in the indian ocean, +y is in the north pole
function anglesToVector(latitude, longitude, altitude) {
    let xz = altitude * Math.cos(rad(latitude))
    let y = altitude * Math.sin(rad(latitude))

    let x = xz * Math.sin(rad(longitude))
    let z = xz * Math.cos(rad(longitude))

    return { x: x, y: y, z: z }
}

// note: pitch 90 degrees up is (0, 0, 1) (+z is up)
function vecToAngles(x, y, z) {
    const xyMag = Math.sqrt(x * x + y * y)

    return {
        yaw: deg(Math.atan2(x, y)), //this makes +y be yaw 0
        pitch: deg(Math.atan2(z, xyMag))
    }
}

// could be better so i didnt have to step around it in other code
function rotate3DPoint(point, pitch, yaw) {
    // Convert angles from degrees to radians
    pitch = pitch * Math.PI / 180
    yaw = yaw * Math.PI / 180

    // Destructure the point coordinates for convenience
    let { x, y, z } = point

    // Apply the pitch rotation (rotation around the x-axis)
    let cosPitch = Math.cos(pitch)
    let sinPitch = Math.sin(pitch)
    let y1 = y * cosPitch - z * sinPitch
    let z1 = y * sinPitch + z * cosPitch

    // Update the coordinates after pitch rotation
    y = y1
    z = z1

    // Apply the yaw rotation (rotation around the y-axis)
    let cosYaw = Math.cos(yaw)
    let sinYaw = Math.sin(yaw)
    let x2 = x * cosYaw + z * sinYaw
    let z2 = -x * sinYaw + z * cosYaw

    // Return the rotated point
    return { x: x2, y: y, z: z2 }
}

const EarthRadius = 6357 //km
// note: yaw 0 degrees is north, 90 degrees is west
async function getPointVector() {
    const userAngles = await getUserPosition()
    const ISSAngles = await getISSPosition()

    // const userAngles = { latitude: -10, longitude: 24, altitude: 0 }
    // const ISSAngles = { latitude: 10, longitude: 24, altitude: 450 }

    console.log(userAngles, ISSAngles)

    const userPos = anglesToVector(userAngles.latitude, userAngles.longitude, userAngles.altitude + EarthRadius)
    const ISSPos = anglesToVector(ISSAngles.latitude, ISSAngles.longitude, ISSAngles.altitude + EarthRadius)

    console.log("positions:")
    console.log(userPos, ISSPos)

    const userToISSVec = {
        x: ISSPos.x - userPos.x,
        y: ISSPos.y - userPos.y,
        z: ISSPos.z - userPos.z
    }
    //* up to here is good

    console.log("positionDifference:")
    console.log(userToISSVec)

    // userAngles is practically a normal vector for the user on the planet, lets rotate space so that the normal vector is upwards (as the user would think of it)
    let relativeUserToISSVec = rotate3DPoint(userToISSVec, 0, -userAngles.longitude)
    relativeUserToISSVec = rotate3DPoint(relativeUserToISSVec, userAngles.latitude, 0)

    // idk still kinda not right
    console.log("relative to user:")
    console.log(relativeUserToISSVec)

    console.log(vecToAngles(relativeUserToISSVec.x, relativeUserToISSVec.y, relativeUserToISSVec.z))
}

// * i think it's good :)))))