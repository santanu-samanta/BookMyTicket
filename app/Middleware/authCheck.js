const jwt = require('jsonwebtoken');
const { errorCode } = require('../Helper/response');


const userauthCheck = (req, res, next) => {
    const token = req.cookies.usertoken || req.params.token;

    if (!token) {
        req.user=null
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRECT || 'WEBSKITTERFINALPROJECT', (err, decoded) => {
        if (err) {
            req.flash('error', 'Session Expired');
            return res.redirect('/user/loginpage-display');
        }

        req.user = decoded;
       return next();
    });
};

const adminauthCheck = (req, res, next) => {
    const token = req.cookies.admintoken || req.params.token;

    if (!token) {
        req.flash('error', 'Please Login');
        return res.redirect('/admin/login');
    }

    jwt.verify(token, process.env.JWT_SECRECT || 'WEBSKITTERFINALPROJECT', (err, decoded) => {
        if (err) {
            req.flash('error', 'Session Expired');
            return res.redirect('/admin/login');
        }

        req.admin = decoded;
        next();
    });
};

const companyauthCheck = (req, res, next) => {
    const token = req.cookies.organizertoken || req.params.token;

    if (!token) {
        req.flash('error', 'Please Login');
        return res.redirect('/organizer/login');
    }

    jwt.verify(token, process.env.JWT_SECRECT || 'WEBSKITTERFINALPROJECT', (err, decoded) => {
        if (err) {
             console.log("Access token expired or invalid:", err.message);
        const returnUrl = encodeURIComponent(req.originalUrl);
        return res.redirect(`/organizer/token-refresh?redirect=${returnUrl}`);
        }

        req.organizer = decoded;
        next();
    });
};

module.exports = { userauthCheck, adminauthCheck, companyauthCheck };
