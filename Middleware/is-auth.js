module.exports.isUser = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin.admin) {
        return res.redirect('/login');
    }
    next();
}