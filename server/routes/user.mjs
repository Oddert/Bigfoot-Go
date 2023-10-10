import passport from 'passport'
import md5 from 'md5'

import { Router } from 'express'

import { isUserAuth } from '../middleware/checkAuth.mjs'

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
                console.error(err)
                return res.status(400).json({ error: err })
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

        const sql = 'INSERT INTO user (username, password) VALUES (?, ?)'
        const params = [data.username, data.password]

        db.run(sql, params, (err) => {
            if (err) {
                console.error(err)
                return res.status(400).json({ error: err })
            }
            passport.authenticate('local')(req, res, () => {
                res.redirect('/')
            })
        })
    })

router.route('/score')
    .put(isUserAuth, (req, res) => {
        const sqlInsert = `UPDATE user SET score = score + 1 WHERE username = '${req.user.username}'`
        db.run(sqlInsert, [], (err) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            return res.status(200).json({
                status: 200,
                data: {
                    score: req.user.score + 1,
                }
            })
        })
    })

router.route('/top-ten')
    .get((req, res) => {
        const sql = 'SELECT username, score from user ORDER BY score DESC LIMIT 10'
        db.all(sql, [], (err, row) => {
            console.log(err, row)
            if (err) {
                return res.status(400).json({ error: err })
            }
            return res.status(200).json({
                status: 200,
                data: row,
            })
        })
    })

export default router
