const routeLabel = require("route-label");
const express = require('express')
const uplodeImage = require('../../Helper/uplodeImage');

const userController = require("../../Module/user/Controller/user.controller");
const { userauthCheck } = require("../../Middleware/authCheck");
const { userrolechack } = require("../../Helper/rolechack");
const router = express.Router()
const namedRouter = routeLabel(router);

// auth
// register page display
namedRouter.get("router.display-registerpage", '/registerpage-display', userController.register_display)
// user register
namedRouter.post("user.register", '/register', userController.register);
// user emailverify
namedRouter.get("user.emailverify", '/emailverify/:token', userauthCheck, userrolechack, userController.emailverify);
// user loginpage display
namedRouter.get("user.display-loginpage", '/loginpage-display', userController.loginpage_display);
// user login`
namedRouter.post("user.login", '/login', userController.login);
// dashboard
namedRouter.get("user.display-dashbaord", '/dashboard-display', userauthCheck, userrolechack, userController.dashboard_display);
// logout
namedRouter.get("user.display-logout", '/logout', userauthCheck, userrolechack, userController.logout);
// booking event in dashboard
namedRouter.get("user.display-events", '/events', userauthCheck, userrolechack, userController.events);
// user profile
namedRouter.get("user.display-profile", '/profile', userauthCheck, userrolechack, userController.userprofile);
// update password
namedRouter.get("user.display-updatepassword", '/change-password', userauthCheck, userrolechack, userController.updatepassword);
// change password update in datbase
namedRouter.post("user.changepassword", '/changepassword', userauthCheck, userrolechack, userController.changepassword)
// fortgot password email send page
namedRouter.get("user.forgotpasswordemail_display", '/forgotpassword', userController.forgotpassemailpage)
// email send page
namedRouter.post("user.forgotpasswordemail", '/forgorpassword-email-send', userController.forgotpassemailsend)
// forgot password enter place
namedRouter.get("user.forgotpasswordemail_enaterpass", '/forgot/password/:token', userauthCheck, userrolechack, userController.forgotpasswordenter)
// forgot password update in datbase
namedRouter.post("user.forgotpassword", '/forgorpassword/data/:token', userauthCheck, userrolechack, userController.forgotpassword)
// delete account page
namedRouter.get("user.display-accountdelete", '/delete/account', userauthCheck, userrolechack, userController.account_del);
// Account Delete
namedRouter.post("user.deleteaccount", '/deleteaccount', userauthCheck, userrolechack, userController.deleteaccount)
// testimonial
namedRouter.post("user.testimonial", '/testimonial/:id', userauthCheck, userrolechack, userController.testimonial)
// testimonial delete
namedRouter.get("user.testimonial-delete", '/delete/testimonial/:id', userauthCheck, userrolechack, userController.testimonialdelete);
namedRouter.get("user.subscriber", '/subscriber', userauthCheck, userrolechack, userController.subscriber);
module.exports = router