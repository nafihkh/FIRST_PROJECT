const jwt = require('jsonwebtoken');

const userService = require("../services/userService");

async function checkLogin(req, res, next) {
    const token = req.cookies.token;
    //console.log("Token:", token);
    if (!token) return res.redirect("/");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // use userId from JWT
        const user = await userService.findById(decoded.userId);
        //console.log("Decoded User:", user);

        if (!user) {
            res.clearCookie("token");
            return res.redirect("/");
        }

        if (user.accessibility === false) {
            return res.render("partials/banned"); // blocked users
        }

        req.user = user; // attach full user
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/");
    }
}

function checkAlreadyLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decoded.role);
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
