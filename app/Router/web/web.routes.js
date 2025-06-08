const express = require("express");
const routeLabel = require("route-label");
const webController = require("../../../webservices/web.controller");
const { companyauthCheck, userauthCheck } = require("../../Middleware/authCheck");
const { corporeterolechack, userrolechack } = require("../../Helper/rolechack");


const router = express.Router();
const namedRouter = routeLabel(router);

// home page
namedRouter.get("home.router",'/',userauthCheck,webController.home)
// event page
namedRouter.get("event.router",'/events',userauthCheck,webController.events)
// single event
namedRouter.get("event_detailse.router",'/detailse/event/:id',userauthCheck,webController.Detailse_Events)
// show booking  event
namedRouter.get("router.event_booking_panal","/eventbooking-panal/:id",userauthCheck,webController.event_booking_panal)
// event seat matrix
namedRouter.get("router.event_booking_panal_seat","/eventbooking-panal-seat/:id",userauthCheck,webController.event_seat_matrix_booking_panal)





// contact page
namedRouter.get("contact.router",'/contact',userauthCheck,webController.contact)
// movies page
namedRouter.get("router.movies","/movies",userauthCheck,webController.movies)
// Single movies page
namedRouter.get("router.single_event","/single-event/:id",userauthCheck,webController.Single_Events)
// show theaters foe movie
namedRouter.get("router.booking_panal","/booking-panal/:id",userauthCheck,webController.booking_panal)
// seat layout
namedRouter.get("router.seat_matrix","/seat-layout/:id",userauthCheck,userrolechack,webController.seat_layout)
// artist profile
namedRouter.get("router.profile_artist","/artist-profile/:id",userauthCheck,webController.artist_profile)
// show traler
namedRouter.get("router.movie_traller","/show_traller/:id",userauthCheck,webController.show_traller)


module.exports = router;