import md5 from 'md5'

import { Strategy as LocalStrategy } from 'passport-local'

import db from '../db.mjs'

export const localStrategy = new LocalStrategy(async (username, password, done) => {
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

export const serialiseUser = (user, done) => {
    console.log('SERIALISE', user)
    return done(null, user.id)
}

export const deserialiseUser = async (id, done) => {
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
}