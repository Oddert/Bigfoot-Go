import passport from 'passport'
import md5 from 'md5'

import { Router } from 'express'

import db from '../db.mjs'

const router = Router()

router.route('/login')
    .get((req, res) => res.render('login.ejs'))
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
    }))

router.route('/logout')
    .get((req, res) => req.logout(() => res.redirect('/')))

router.route('/users')
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

router.route('/signup')
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

export default router
