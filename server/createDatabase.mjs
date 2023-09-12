import md5 from 'md5'

import db from './db.mjs'

db.run(
    `CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username text UNIQUE,
        password text,
        CONSTRAINT username_unique UNIQUE (username)
    )`,
    err => {
        if (err) {
            console.log('...table already exists')
            console.error(err.message)
        } else {
            console.log('...table created')
            const insert = 'INSERT INTO user (username, password) VALUES (?, ?)'
            db.run(insert, ['admin', md5('admin123455')])
            db.run(insert, ['testuser', md5('user123455')])
            console.log('...test users inserted')
        }
    }
)
