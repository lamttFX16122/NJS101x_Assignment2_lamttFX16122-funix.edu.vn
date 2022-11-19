module.exports.isUser = (req, res, next) => {
    if (!req.session.user) {
        req.flash('requireLogin', 'Yêu cầu đăng nhập để sử dụng chức năng này!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin.admin) {
        req.flash('requireLogin', 'Hãy đăng nhập bằng tài khoảng Admin để sử dụng chức năng này!');
        return res.redirect('/login');
    }
    next();
}