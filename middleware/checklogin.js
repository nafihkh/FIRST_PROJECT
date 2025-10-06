const jwt = require('jsonwebtoken');

function checkLogin(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect("/user/login");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 

       
        next();
    } catch (err) {
        res.clearCookie('token');
        
        return res.redirect("/user/login");
    }
}

function checkAlreadyLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        switch (decoded.role) {
            case 'admin':
                return res.redirect("/admin/dashboard");
            case 'worker':
                return res.redirect("/worker/dashboard");
            case 'user':
                return res.redirect("/user/dashboard");
            default:
                return res.redirect("/user/login");
        }
    } catch (err) {
        res.clearCookie('token');
        return next();
    }
}

module.exports = { checkLogin, checkAlreadyLoggedIn };
