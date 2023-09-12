import { Router } from 'express'

import bfootSeedData from '../data/bfootConverted.json' assert { type: 'json' }

const router = Router()

router.route('/')
    .get((req, res) => {
        // TODO: logic to interact with Mostly.ai API
        return res.json({ data: bfootSeedData })
    })

export default router
