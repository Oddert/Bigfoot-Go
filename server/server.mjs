import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import md5 from 'md5'
import morgan from 'morgan'
import path from 'path'
import passport from 'passport'
import session from 'express-session'

import { Strategy as LocalStrategy } from 'passport-local'

import * as dotenv from 'dotenv'

import bfootSeedData from '../data/bfootConverted.json' assert { type: 'json' }

import { isUserAuth } from './middleware/checkAuth.mjs'

import db from './db.mjs'

dotenv.config()

const __dirname = path.resolve(path.dirname(''))

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

passport.use(
    new LocalStrategy(async (username, password, done) => {
        console.log('LOCAL STRATEGY', username, password, done)
        db.get(
            'SELECT * FROM user WHERE username = ?',
            [username],
            (err, row) => {
                console.log(err, row)
                if (!row || err) {
                    return done(null, false)
                }
                const pwd = md5(password)
                console.log(pwd, password)
                if (pwd !== row.password) {
                    console.log('passwords match')
                    return done(null, false)
                }
                console.log('passwords dont match')
                return done(null, row)
            }
        )
    })
)

passport.serializeUser((user, done) => {
    console.log('DESERIALISE', user)
    return done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    console.log('DESERIALISE', id)
    db.get(
        'SELECT * FROM user WHERE id = ?',
        [id],
        (err, row) => {
            console.log(err, row)
            if (!row || err) {
                return done(null, false)
            }
            return done(null, row)
        }
    )
})

app.route('/')
    .get(isUserAuth, (req, res) => res.sendFile(path.join(__dirname, './index.html')))

app.route('/login')
    .get((req, res) => res.sendFile(path.join(__dirname, './login.html')))
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
    }))

app.route('/users')
    .get((req, res) => {
        const sql = 'select * from user'
        db.get(sql, [], (err, rows) => {
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            res.json({
                message: 'success',
                data: rows,
            })
        })
    })

app.route('/signup')
    .post((req, res) => {
        const errors = []

        if (!req.body.password) {
            errors.push('No password specified')
        }
        if (!req.body.username) {
            errors.push('No username specified')
        }
        if (errors.length) {
            return res.status(400).json({ error: errors.join(', ') })
        }
        
        const data = {
            username: req.body.username,
            password: md5(req.body.password),
        }
        console.log('making user: ', data)

        const sql = 'INSERT INTO user (username, password) VALUES (?, ?)'
        const params = [data.username, data.password]

        db.run(sql, params, (err, row) => {
            console.log('MADE user', err, row)
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            res.redirect('/')
        })
    })

app.route('/logout')
    .get((req, res) => req.logout(() => res.redirect('/')))

app.route('/bfoot')
    .get((req, res) => {
        // TODO: logic to interact with Mostly.ai API
        return res.json({ data: bfootSeedData })
    })

const now = new Date().toLocaleTimeString('en-GB')

app.listen(
    PORT,
    () => console.log(`[${now}] Server initialised on PORT ${PORT}...`)
)
