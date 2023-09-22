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

const __dirname = __dirname || path.resolve(path.dirname(''))

const app = express()
const PORT = process.env.PORT || 3000

app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
)

app.use(express.static(path.join(__dirname, './')))

app.use(helmet({ xContentTypeOptions: false }))
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

passport.use(localStrategy)

passport.serializeUser(serialiseUser)

passport.deserializeUser(deserialiseUser)

app.route('/')
    .get(isUserAuth, (req, res) => res.sendFile(path.join(__dirname, './index.html')))

app.use('/bfoot', routeBfoot)
app.use('/user', routeUser)

const now = new Date().toLocaleTimeString('en-GB')

app.listen(
    PORT,
    () => console.log(`[${now}] Server initialised on PORT ${PORT}...`)
)
