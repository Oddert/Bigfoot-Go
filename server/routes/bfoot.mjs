import { Router } from 'express'

import centerCoordinatesOnPlayer from '../../src/utils/centerCoordinatesOnPlayer.mjs'

// import bfootSeedData from '../../data/bfoot.json' assert { type: 'json' }
// import bfootSeedData from '../../data/bfootConverted.json' assert { type: 'json' }
// import bfootSeedData from '../../data/bfoot.mjs'

import { pickRand } from '../utils/commonUtils.mjs'
import { getGeneratedBfootDataList } from '../utils/fileSystemUtils.mjs'

const router = Router()

router.route('/')
    .get((req, res) => {
        getGeneratedBfootDataList(dataList => {
            const bfootSeedData = pickRand(dataList)
            const offset = Math.floor(Math.random() * 7)
            console.log(bfootSeedData.length, bfootSeedData.filter((_, idx) => !((idx + offset) % 6)).length)
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
    })

router.route('/test')
    .get((req, res) => {
        return getGeneratedBfootDataList((converted, files) => res.json({
            message: 'ok',
            files,
            converted,
        }))
    })

export default router
