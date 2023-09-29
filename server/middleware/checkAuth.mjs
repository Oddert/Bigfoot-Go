export function isUserAuth (req, res, next) {
    console.log('[isUserAuth]', req.user)
    if (req.user) {
        return next()
    }
    return res.redirect('/user/login')
}
