import { Router } from 'express'

import centerCoordinatesOnPlayer from '../../src/centerCoordinatesOnPlayer.mjs'

import bfootSeedData from '../../data/bfoot.json' assert { type: 'json' }
// import bfootSeedData from '../../data/bfootConverted.json' assert { type: 'json' }

const router = Router()

router.route('/')
    .get((req, res) => {
        // TODO: logic to interact with Mostly.ai API
        console.log(bfootSeedData.length, bfootSeedData.filter((_, idx) => !(idx % 6)).length)
        return res.json({
            data: centerCoordinatesOnPlayer(
                bfootSeedData.filter((_, idx) => !(idx % 6)),
                { lat: 39.50, lon: -98.35, },
                {
                    lat: Number(req.query?.lat || 39.50),
                    lon: Number(req.query?.lon || -98.35),
                },
                2,
            )
        })
    })

export default router
