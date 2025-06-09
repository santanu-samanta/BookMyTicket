const routeLabel = require("route-label");
const express=require('express');
const organizerComtroller = require("../../Module/organizer/Controller/organizer.comtroller");
const uplodeImage = require("../../Helper/uplodeImage");


const { corporeterolechack } = require("../../Helper/rolechack");
const { companyauthCheck, userauthCheck } = require("../../Middleware/authCheck");
const jwt = require('jsonwebtoken');
const eventOrganizerController = require("../../Module/organizer/Controller/event.organizer.controller");
const movieController = require("../../Module/organizer/Controller/movie.controller");

const router=express.Router()
const namedRouter = routeLabel(router);

// organizer auth

router.get('/token-refresh', (req, res) => {
    const refreshToken = req.cookies.organizerreftoken;
    const redirectUrl = req.query.redirect || '/organizer/dashboard';

    if (!refreshToken) {
        req.flash('warning', 'Session expired. Please login again.');
        return res.redirect('/organizer/login');
    }

    try {
        const decoded = jwt.verify(refreshToken, 'SKITTERFINALPROJECT');
       
        const { iat, exp, ...userData } = decoded;
        const newAccessToken = jwt.sign(userData, process.env.JWTSECRECT || 'WEBSKITTERFINALPROJECT', { expiresIn: '1h' });

        res.cookie('organizertoken', newAccessToken);

        req.flash('success', 'Session refreshed.');
        return res.redirect(redirectUrl);
    } catch (err) {
        console.log(err)
        req.flash('warning', 'Refresh token expired. Please login again.');
        return res.redirect('/organizer/login');
    }
});



// register page 
namedRouter.get('organizer.register','/register',userauthCheck,organizerComtroller.registerpage_display)
// forgot passeord
namedRouter.get('organizer.forgotepassword','/forgot/password',userauthCheck,organizerComtroller.forgot_password)
namedRouter.post('organizer.forgotepassword_email','/forgot/password/emailsend',userauthCheck,organizerComtroller.forgotpassemailsend)
namedRouter.get('organizer.forgotepassword_page','/forgot/password/page/:token',userauthCheck,organizerComtroller.forgot_password_dataenter)
namedRouter.post('organizer.forgotepassword_data','/forgot/password/:token',userauthCheck,organizerComtroller.forgotpassword)
// organizer data store
namedRouter.post('organizer.datastore','/registerdata',uplodeImage.single('image'),organizerComtroller.registerdata)
// organizer login page display
namedRouter.get('organizer.login','/login',userauthCheck,organizerComtroller.login_page_display)
// organizer login data store
namedRouter.post('organizer.logindata','/logindata_store',organizerComtroller.login)
// organizer change password display
namedRouter.get('organizer.changepassword','/change-password',companyauthCheck,corporeterolechack,organizerComtroller.organizer_change_password_display)
// organizer change data store
namedRouter.post('organizer.changepassworddata','/change-passworddata',companyauthCheck,corporeterolechack,organizerComtroller.organizer_change_password_data_store)
// organizer dashboard
// namedRouter.post('organizer.changepassworddata','/change-passworddata',companyauthCheck,corporeterolechack,organizerComtroller.organizer_change_password_data_store)
// oranizer profile
namedRouter.get('organizer.profile','/profile',companyauthCheck,corporeterolechack,organizerComtroller.organizer_profile)
// oranizer profile update
namedRouter.get('organizer.profile_update','/profile-update',companyauthCheck,corporeterolechack,organizerComtroller.organizer_profile_update)
// organizer change data store
namedRouter.post('organizer.profile_update_data','/profile-update-data',companyauthCheck,corporeterolechack,uplodeImage.single('logo'),organizerComtroller.organizer_profile_update_data)
// dashboard
namedRouter.get('organizer.dashboard','/dashboard',companyauthCheck,corporeterolechack,organizerComtroller.organizer_dashboard_display)
// organizer logout
namedRouter.get('organizer.logout','/logout',companyauthCheck,corporeterolechack,organizerComtroller.logout)
// accountdelete page
namedRouter.get('organizer.delete_account','/delete-account',companyauthCheck,corporeterolechack,organizerComtroller.accountdelete)
namedRouter.post('organizer.delete_coaccount','/delete/account',companyauthCheck,corporeterolechack,organizerComtroller.deleteaccount)



// movie events
// events table
namedRouter.get('organizer.events_table','/events',companyauthCheck,corporeterolechack,movieController.show_events)
namedRouter.get('organizer.reject_events_table','/reject-events',companyauthCheck,corporeterolechack,movieController.show_reject_events)
// delete movie list
namedRouter.get('organizer.events_delete','/movies/delete/:id',companyauthCheck,corporeterolechack,movieController.show_events_single_del)
// single movie
namedRouter.get('organizer.events_details_single','/events/details_single/:id',companyauthCheck,corporeterolechack,movieController.show_events_single)
// add events
namedRouter.get('organizer.add_events','/add_event',companyauthCheck,corporeterolechack,movieController.add_event)
// add events data store
namedRouter.post('organizer.add_events_data','/add_event_data',companyauthCheck,corporeterolechack,movieController.add_event_data)
// edit event data
namedRouter.get('organizer.edit_events_data','/event-edit/:id',companyauthCheck,corporeterolechack,movieController.edit_event_data)
// edit events data store
namedRouter.post('organizer.edit_event_data_store','/edit_event_data/:id',companyauthCheck,corporeterolechack,movieController.edit_event_data_store)



// events
// add events
namedRouter.get('organizer.add_events_organizer','/event/create',companyauthCheck,corporeterolechack,eventOrganizerController.add_event)
// movie data stor in mongodb
namedRouter.post('organizer.add_events_organizer_data','/event/create/data_store',companyauthCheck,corporeterolechack,uplodeImage.fields([
    { name: 'images', maxCount: 5 },  // matches input name="posters"
    { name: 'videos', maxCount: 5 } , // matches input name="trailers" (no brackets)
    { name: 'artistimage', maxCount: 10 } , // matches input name="trailers" (no brackets)
  ]),eventOrganizerController.add_event_data)
//   edit event
namedRouter.get('organizer.add_events_organizer_edit','/event/edit/:id',companyauthCheck,corporeterolechack,eventOrganizerController.edit_event)
// edit event data store
namedRouter.post('organizer.edit_events_organizer_data','/event/edit/data/:id',companyauthCheck,corporeterolechack,uplodeImage.fields([
    { name: 'images', maxCount: 5 },  // matches input name="posters"
    { name: 'videos', maxCount: 5 } , // matches input name="trailers" (no brackets)
    { name: 'artistimage', maxCount: 10 } , // matches input name="trailers" (no brackets)
  ]),eventOrganizerController.edit_event_data)

// events table
namedRouter.get('organizer.events-organizer_table','/events-table',companyauthCheck,corporeterolechack,eventOrganizerController.show_events)
namedRouter.get('organizer.reject_events-organizer_table','/reject-events-table',companyauthCheck,corporeterolechack,eventOrganizerController.reject_show_events)
// single event
namedRouter.get('organizer.event_single','/event/single/details/:id',companyauthCheck,corporeterolechack,eventOrganizerController.event_single_details)
// delete event table
namedRouter.get('organizer.event_delete','/event/delete/:id',companyauthCheck,corporeterolechack,eventOrganizerController.show_events_single_del)

module.exports=router