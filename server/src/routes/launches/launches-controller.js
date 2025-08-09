const {
    getAllLaunches,
    existLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,
} = require('../../models/launches-model')

const { getPagination } = require('../../services/query')

async function httpGetAllLaunches(req, res){
    const { skip, limit } = getPagination(req.query)
    const lauches = await getAllLaunches(skip, limit)
    return res.status(200).json(lauches)
}

async function httpAddNewLaunch(req, res){
    const launch = req.body

    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
        return res.status(400).json({
            error: 'Missing require launch property'
        })
    }

    launch.launchDate = new Date(launch.launchDate)
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid launch date'
        })
    }

    await scheduleNewLaunch(launch)
    console.log(launch);
    
    return res.status(201).json(launch)
}

async function httpAbortLaunch(req, res){
    const launchId = Number(req.params.id)
    const exitsLaunch = await existLaunchWithId(launchId)

    // if launch doesn't exist
    if(!exitsLaunch){
        return res.status(404).json({
            error: 'Launch not found'
        })
    }

    // if launch does exist
    const aborted = await abortLaunchById(launchId)
    if(!aborted){
        return res.status(400).json({
            error: 'Launch not aborted'
        })
    }
    
    return res.status(200).json({
        ok: true,
    })
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}