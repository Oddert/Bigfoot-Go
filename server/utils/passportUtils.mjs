import md5 from 'md5'

import { Strategy as LocalStrategy } from 'passport-local'

import db from '../db.mjs'

export const localStrategy = new LocalStrategy(async (username, password, done) => {
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

export const serialiseUser = (user, done) => {
    return done(null, user.id)
}

export const deserialiseUser = async (id, done) => {
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
}