const User = require('../db/user');
const auth = (req, res, next) => {
    let token = req.cookies.authToken;

    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) {
            req.isAuth = false;
            next();
            // return res.json({ isAuth: false, error: true });
        }
        req.token = token
        req.user = user;
        req.isAuth = true;
        next();
    });
}
module.exports = { auth }