const launches = new Map()

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customer: ['HHS', 'NASA'],
    upcoming: true,
    success: true
}

let lastestFlightNumber = 100

launches.set(launch.flightNumber, launch)

function getAllLaunches(){
    return Array.from(launches.values())
}

function addNewLaunch(launch){
    lastestFlightNumber++
    launches.set(lastestFlightNumber, Object.assign(launch,{
        success: true,
        upcoming: true,
        customer: ['Huynh', 'Son'],
        flightNumber: lastestFlightNumber,
    }))
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
}