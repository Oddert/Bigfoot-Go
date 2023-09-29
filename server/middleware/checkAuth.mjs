export function isUserAuth (req, res, next) {
    if (req.user) {
        return next()
    }
    return res.redirect('/user/login')
}
