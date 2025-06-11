const routeLabel = require("route-label");
const express = require('express');
const adminComtroller = require("../../Module/admin/Controller/admin.comtroller");
const adminCompanyController = require("../../Module/admin/Controller/admin.company.controller");
const adminArtistController = require("../../Module/admin/Controller/admin.artist.controller");
const uplodeImage = require("../../Helper/uplodeImage");
const adminMovieColtroller = require("../../Module/admin/Controller/admin.movie.coltroller");

const { adminrolechack } = require("../../Helper/rolechack");
const { adminauthCheck } = require("../../Middleware/authCheck");
const adminEventController = require("../../Module/admin/Controller/admin.event.controller");
const adminReviewUserController = require("../../Module/admin/Controller/admin.review.user.controller");

const router = express.Router()
const namedRouter = routeLabel(router);

// admin auth
/**
 * @swagger
 * /admin/login:
 *   get:
 *     summary: Render admin login page
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Login page loaded successfully
 */
// admin login display
namedRouter.get('admin.login', '/login', adminComtroller.loginpage_display)
/**
 * @swagger
 * /admin/login-data:
 *   post:
 *     summary: Process admin login credentials
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       302:
 *         description: Redirect to dashboard on success or login page on failure
 */
// admin login data cahck
namedRouter.post('admin.login-data', '/login-data', adminComtroller.login)
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Display admin dashboard
 *     tags: [Admin Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard page rendered
 *       401:
 *         description: Unauthorized
 */
// admin dashboard display
namedRouter.get('admin.dashboard', '/dashboard', adminauthCheck, adminrolechack, adminComtroller.admin_dashbord_display)
/**
 * @swagger
 * /admin/logout:
 *   get:
 *     summary: Logout admin and destroy session
 *     tags: [Admin Auth]
 *     responses:
 *       302:
 *         description: Redirect to login after logout
 */
// admin logout
namedRouter.get('admin.logout', '/logout', adminauthCheck, adminrolechack, adminComtroller.admin_logout)


// booking 
// booking table show in admin panal
namedRouter.get('admin.companies_booking_histroy', '/booking-histroy', adminauthCheck, adminrolechack, adminComtroller.booking_table)
// past booking 
namedRouter.get('admin.past_companies_booking_histroy', '/past/booking-histroy', adminauthCheck, adminrolechack, adminComtroller.booking_past_table)
// booking detailse show in admin panal
namedRouter.get('admin.companies_booking_detailse', '/booking-detailse/:id', adminauthCheck, adminrolechack, adminComtroller.booking_detailse)
// booking approved
namedRouter.get('admin.companies_booking_approved', '/booking/approved/:id', adminauthCheck, adminrolechack, adminComtroller.booking_approved)
// booking reject
namedRouter.post('admin.companies_booking_reject', '/booking/reject/:id', adminauthCheck, adminrolechack, adminComtroller.booking_reject)


// company
// company table show in admin panal
namedRouter.get('admin.companies', '/companies', adminauthCheck, adminrolechack, adminComtroller.company_table)
// company reaject page display in admin panal
namedRouter.get('admin.companies_reject', '/companies-reject/:id', adminauthCheck, adminrolechack, adminCompanyController.company_reject_page)
// company reaject page display in admin panal
namedRouter.get('admin.companies_single', '/companies-single/:id', adminauthCheck, adminrolechack, adminCompanyController.company_single_details)
// company reaject reject data store in admin panal
namedRouter.post('admin.companies_reject-data', '/reject-data/:id', adminauthCheck, adminrolechack, adminCompanyController.company_reject_data_store)
// compant approved admin panal
namedRouter.get('admin.approved', '/companies-approve/:id', adminauthCheck, adminrolechack, adminCompanyController.companies_approve)



// Artist
// show artist data
namedRouter.get('admin.artist_list', '/artists-list', adminauthCheck, adminrolechack, adminArtistController.artist_data_show)
// show artist data
namedRouter.get('admin.delete_artist_list', '/delete_artists-list', adminauthCheck, adminrolechack, adminArtistController.delete_artist_data_show)
// add artist
namedRouter.get('admin.artist_add', '/artists-add', adminauthCheck, adminrolechack, adminArtistController.artist_add)
// add artist store
namedRouter.post('admin.artist_add_datastore', '/artist-add-data-store', adminauthCheck, adminrolechack, uplodeImage.single('image'), adminArtistController.artist_store_add)
// show  artist profile
namedRouter.get('admin.artist_profile', '/artists/profile/:id', adminauthCheck, adminrolechack, adminArtistController.artist_single)
// artist profile update from
namedRouter.get('admin.profile_update', '/artists/profile_update/:id', adminauthCheck, adminrolechack, adminArtistController.artist_update)
// artist profile update from data store
namedRouter.post('admin.profile_update_data', '/artists/artist-update/:id', adminauthCheck, adminrolechack, uplodeImage.single('image'), adminArtistController.artist_update_data)
// artist profile delete
namedRouter.get('admin.artist_profile_delete', '/artists/profile/delete/:id', adminauthCheck, adminrolechack, adminArtistController.artist_delete)
// artist profile undo
namedRouter.get('admin.artist_profile_undo', '/artists/profile/undo/:id', adminauthCheck, adminrolechack, adminArtistController.artist_undo)
// many artist profile undo
namedRouter.post('admin.artist_bilk_profile_undo', '/artists/bulk-undo', adminauthCheck, adminrolechack, adminArtistController.artist_undo_bulck)



// movie
// add a movie page display
namedRouter.get('admin.add_movie', '/movie-add', adminauthCheck, adminrolechack, adminMovieColtroller.movie_add)
// movie add data store
namedRouter.post(
  'admin.movie_data',
  '/movie-add-data',
  adminauthCheck,
  adminrolechack,
  uplodeImage.fields([
    { name: 'posters', maxCount: 5 },  // matches input name="posters"
    { name: 'trailers', maxCount: 5 }  // matches input name="trailers" (no brackets)
  ]),
  adminMovieColtroller.movie_add_data_store
);
// movie list
namedRouter.get('admin.movie_list', '/movie-list', adminauthCheck, adminrolechack, adminMovieColtroller.movie_list)
// show  movie profile
namedRouter.get('admin.movie_profile', '/movie/single/:id', adminauthCheck, adminrolechack, adminMovieColtroller.movie_single)
// edit a movie page display
namedRouter.get('admin.movie_profile_edit', '/movie-edit/:id', adminauthCheck, adminrolechack, adminMovieColtroller.movie_edit)
// movie edit data store
namedRouter.post(
  'admin.movie_edit_data',
  '/movie-edit-data/:id',
  adminauthCheck,
  adminrolechack,
  uplodeImage.fields([
    { name: 'posters', maxCount: 5 },  // matches input name="posters"
    { name: 'trailers', maxCount: 5 }  // matches input name="trailers" (no brackets)
  ]),
  adminMovieColtroller.movie_edit_data_store);
  // show  movie profile delete
namedRouter.get('admin.movie_profile_delete', '/movie/delete/:id', adminauthCheck, adminrolechack, adminMovieColtroller.movie_delete)
// show  movie delete lest
namedRouter.get('admin.delete_movies_list', '/delete-movie-list', adminauthCheck, adminrolechack, adminMovieColtroller.detete_movie_list)
// show  movie undo
namedRouter.post('admin.movie_undo', '/movie-undo/:id', adminauthCheck, adminrolechack, adminMovieColtroller.movie_undo)
// many movie undo
namedRouter.post('admin.movie_undo_bulk', '/bulk-movie-undo', adminauthCheck, adminrolechack, adminMovieColtroller.movie_undo_bulck)




// event
// event list
namedRouter.get('admin.event-list','/event/list',adminauthCheck,adminrolechack,adminEventController.event_list)
// past event list
namedRouter.get('admin.past_event-list','/past-event/list',adminauthCheck,adminrolechack,adminEventController.past_event_list)
// delete event list
namedRouter.get('admin.delete_event-list','/delete/event/list',adminauthCheck,adminrolechack,adminEventController.delete_event_list)
// single event detailse
namedRouter.get('admin.event-details','/event/single-details/:id',adminauthCheck,adminrolechack,adminEventController.event_details)
// event reject by admin
namedRouter.get('admin.event-details_reject','/event/reject/single-details/:id',adminauthCheck,adminrolechack,adminEventController.event_reject)
// reject admin approved by admin
namedRouter.get('admin.event-details_approved','/event/approved/single-details/:id',adminauthCheck,adminrolechack,adminEventController.event_approved)

// review and user
// user list
namedRouter.get('admin.user-list','/user/list',adminauthCheck,adminrolechack,adminReviewUserController.user_list)
// delete user list
namedRouter.get('admin.deluser-list','/delete/user/list',adminauthCheck,adminrolechack,adminReviewUserController.delete_user_list)
// review list
namedRouter.get('admin.review-list','/review/list',adminauthCheck,adminrolechack,adminReviewUserController.review_list)
// delete review list
namedRouter.get('admin.delreview-list','/delreview/list',adminauthCheck,adminrolechack,adminReviewUserController.delete_review_list)
// single review detailse
namedRouter.get('admin.review-details','/review/details/:id',adminauthCheck,adminrolechack,adminReviewUserController.review_details)
// review mwessage delete
namedRouter.get('admin.review-reject','/review/reject/:id',adminauthCheck,adminrolechack,adminReviewUserController.review_delete)
// user account delete
namedRouter.get('admin.account-reject','/account/delete/:id',adminauthCheck,adminrolechack,adminReviewUserController.user_account_delete)
// user account undo
namedRouter.get('admin.account-undo','/account/undo/:id',adminauthCheck,adminrolechack,adminReviewUserController.user_account_undo)
// many user account undo 
namedRouter.get('admin.account-undo_many','/account/bulck/undo/:id',adminauthCheck,adminrolechack,adminReviewUserController.user_account_undo)

module.exports = router