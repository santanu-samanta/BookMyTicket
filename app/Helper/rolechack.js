const userRepositories = require("../Module/user/Repositories/user.repositories");

const userrolechack = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            req.flash('error', 'Please Login')
            return res.redirect('/user/loginpage-display')
            
        }
        if (user.role == 'user') {
            // const user=req.user;
            // const userfind=await userRepositories.existuser(user.email)
            // if(userfind.isadmindelete){
            //      req.flash('error', `Admin Hasbeen Delete Your Account Because ${userfind.admindelete_msg}`)
            //     return res.redirect('/user/logout')
            // }
                return next()
             
        }

        req.flash('error', 'Please Login')
        return res.redirect('/user/loginpage-display')

    } catch (error) {
        console.log(error)
    }
};
const corporeterolechack = async (req, res, next) => {
    try {
        const user = req.organizer;

        if (user.role == 'Corporate') {
            return next()
        }
        req.flash('error', 'Only Corporate Can Login')
        return res.redirect('/organizer/login')
    } catch (error) {
        console.log(error)
    }
};
const adminrolechack = async (req, res, next) => {
    try {
        const user = req.admin;

        if (user.role == 'admin') {
            return next()
        }
        req.flash('error', 'Only Admin Can Login')
        return res.redirect('/admin/login')
    } catch (error) {
        console.log(error)
    }
};

module.exports = { userrolechack, adminrolechack, corporeterolechack };
