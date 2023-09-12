import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import md5 from 'md5'
import morgan from 'morgan'
import path from 'path'
import passport from 'passport'
import session from 'express-session'

import { Strategy as LocalStrategy } from 'passport-local'

import * as dotenv from 'dotenv'

import { isUserAuth } from './middleware/checkAuth.mjs'

import db from './db.mjs'

dotenv.config()

const __dirname = path.resolve(path.dirname(''))

const app = express()
const PORT = 3000

app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
)

app.use(express.static('../'))

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
        db.get(
            'SELECT * FROM user WHERE username = ?',
            [username],
            (err, row) => {
                if (!row || err) {
                    return done(null, false)
                }
                const pwd = md5(password)
                if (pwd !== row.password) {
                    return done(null, false)
                }
                return done(null, row)
            }
        )
    })
)

passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser((user, done) => {
    db.get(
        'SELECT * FROM user WHERE id = ?',
        [id],
        (err, row) => {
            if (!row || err) {
                return done(null, false)
            }
            return done(null, row)
        }
    )
})

app.route('/')
    .get(isUserAuth, (req, res) => res.sendFile('./index.html'))

app.route('/login')
    .get((req, res) => res.sendFile(path.join(__dirname, './login.html')))
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
    }))

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
        
        const defaultImg = imgUrls[0]

        const data = {
            username: req.body.username,
            password: md5(req.body.password),
        }
        console.log('making user: ', data)

        const sql = 'INSERT INTO user (name, username) VALUES (?, ?)'
        const params = [data.name, data.username]

        db.run(sql, params, (err, row) => {
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            res.redirect('/')
        })
    })

app.route('/logout')
    .get((req, res) => req.logout(() => res.redirect('/')))

app.listen(
    PORT,
    () => console.log(`[${new Date().toLocaleTimeString('en-GB')}] Server initialised on PORT ${PORT}...`)
)
