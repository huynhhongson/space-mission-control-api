const axios = require('axios')
const launchesDatabase = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100

const launches = new Map()

// const launch = {
//     flightNumber: 100, //flight_number
//     mission: 'Kepler Exploration X', //name
//     rocket: 'Explorer IS1', //rocket.name
//     launchDate: new Date('December 27, 2030'),//date_local
//     target: 'Kepler-442 b', //not applicable
//     customers: ['HHS', 'NASA'], //payload.customers for each payload
//     upcoming: true, //upcoming
//     success: true //success
// }

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'


async function populateLaunches() {
    console.log('Downloading lauch data...')
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate:[
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: "payloads",
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    })

    if(response.status !== 200){
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed')
    }

    const launchDocs = response.data.docs
    for(const lauchDoc of launchDocs){
        const payloads = lauchDoc['payloads']
        const customers = payloads.flatMap((payloads) => {
            return payloads['customers']
        })
        const lauch = {
            flightNumber: lauchDoc['flight_number'],
            mission: lauchDoc['name'],
            rocket: lauchDoc['rocket']['name'],
            launchDate: lauchDoc['date_local'],
            upcoming: lauchDoc['upcoming'],
            success: lauchDoc['success'],
            customers,
        }
        console.log(`${lauch.flightNumber} ${lauch.mission} `);
        
        await saveLaunch(lauch)
    }
}

async function loadLaunchData(params) {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })

    if(firstLaunch){
        console.log('Launch data already loaded...');
        return
    }else{
        await populateLaunches()
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter)
}

async function existLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId,
    })
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber')
        
    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER
    }
    return latestLaunch.flightNumber
}

async function getAllLaunches(skip, limit){
    return await launchesDatabase
        .find({},{ '_id': 0, '__v': 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit)
}

async function saveLaunch(launch){
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch,{
        upsert: true,
    })
}

async function scheduleNewLaunch(launch) {
        const planet = await planets.findOne({
        keplerName: launch.target,
    })

    if(!planet){
        throw new Error('No matching planet found')
    }
    const newFlightNumber = await getLatestFlightNumber() + 1
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Huynh', 'Son'],
        flightNumber: newFlightNumber,
    })

    await saveLaunch(newLaunch)
}


async function abortLaunchById(launchId){
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    },{
        upcoming: false,
        success: false,
    })

    return aborted.modifiedCount === 1
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    existLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,
}