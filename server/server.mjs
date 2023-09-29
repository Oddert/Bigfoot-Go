import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import passport from 'passport'
import session from 'express-session'

import * as dotenv from 'dotenv'

import { deserialiseUser, localStrategy, serialiseUser } from './utils/passportUtils.mjs'

import { isUserAuth } from './middleware/checkAuth.mjs'

import routeBfoot from './routes/bfoot.mjs'
import routeUser from './routes/user.mjs'

dotenv.config()

const dirname = path.resolve(path.dirname(''))

const app = express()
const PORT = process.env.PORT || 3000

app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
)

app.use(express.static(path.join(dirname, './')))

app.use(helmet({
    xContentTypeOptions: false,
    contentSecurityPolicy: {
        useDefaults: false,
        'block-all-mixed-content': true,
        'upgrade-insecure-requests': true,
        directives: {
            'default-src': [
                '\'self\''
            ],
            'base-uri': '\'self\'',
            'font-src': [
                '\'self\'',
                'https:',
                'data:'
            ],
            'frame-ancestors': [
                '\'self\''
            ],
            'img-src': [
                '\'self\'',
                'data:',
                'https://tile.openstreetmap.org',
                'https://unpkg.com',
            ],
            'object-src': [
                '\'none\''
            ],
            'script-src': [
                '\'self\'',
                'https://unpkg.com'
            ],
            'script-src-attr': '\'none\'',
            'style-src': [
                '\'self\'',
                'https://fonts.googleapis.com',
                'https://unpkg.com',
            ],
        },
    }
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser(process.env.SESSION_SECRET))
app.use(cors())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))
app.use(passport.initialize())
app.use(passport.session())

app.set('views', path.join(dirname, './server/views/'))
app.set('view engine', 'ejs')

passport.use(localStrategy)

passport.serializeUser(serialiseUser)

passport.deserializeUser(deserialiseUser)

app.route('/')
    .get(isUserAuth, (req, res) =>
        res.render(
            'index.ejs',
            {
                score: req.user.score,
                username: req.user.username,
            },
        )
    )

app.use('/bfoot', routeBfoot)
app.use('/user', routeUser)

const now = new Date().toLocaleTimeString('en-GB')

app.listen(
    PORT,
    () => console.log(`[${now}] Server initialised on PORT ${PORT}...`)
)
