
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../../../Config/emailConfig');
const path = require('path');
const fs = require('fs');
const { title } = require('process');
const { errorCode } = require('../../../Helper/response');
const { hashpassword } = require('../../../Helper/auth');
const organizerRepositories = require('../Repositories/organizer.repositories');
const adminMovieRepo = require('../../admin/Repositories/admin.movie.repo');
const eventrepo = require('../Repositories/event.repositories'); // Make sure this is your event repo file
const Joi = require('joi');
const eventRepositories = require('../Repositories/event.repositories');


class organizerEventController {

    async show_events(req, res) {
        try {
            const company = req.organizer;
            const email = company.email;
            const companyexist = await organizerRepositories.find(email);

            const companydata = await eventRepositories.finbbookingdatafordashboard(company._id)
            const companyda = companydata.map(curr => {
                const schedules = curr.schedules.map(schedule => {
                    const totalTickets =
                        schedule.prime_seats +
                        schedule.golden_seats +
                        schedule.clasic_seats;

                    const ticketsSold =
                        (schedule.prime_seats_book?.length || 0) +
                        (schedule.golden_seats_book?.length || 0) +
                        (schedule.classic_seats_book?.length || 0);

                    const revenue =
                        (schedule.prime_seats_book?.length || 0) * schedule.prime_ticket_price +
                        (schedule.golden_seats_book?.length || 0) * schedule.golden_ticket_price +
                        (schedule.classic_seats_book?.length || 0) * schedule.clasic_ticket_price;

                    return {
                        Date: schedule.date,
                        Time: `${schedule.start_time} - ${schedule.end_time}`,
                        Tickets: totalTickets,
                        Tickets_Sold: ticketsSold,
                        Revenue: revenue
                    };
                });

                return {
                    event_id: curr._id,
                    Event: curr.movie_details?.name || 'Unknown',
                    Date_time: schedules
                };
            });
            console.log(JSON.stringify(companydata, null, 2));

            if (!companyexist.isverify) {
                req.flash('warning', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            return res.render('organizer/dashbord/Events/eventstable', {
                title: 'Event Table - BookMyTicket', companyda,user:company
            });
        } catch (error) {
            console.log(error);
            req.flash('warning', 'Something went wrong.');
            return res.redirect('/organizer/dashboard');
        }
    }
    async completed_movie(req, res) {
        try {
            const company = req.organizer;
            const email = company.email;
            const companyexist = await organizerRepositories.find(email);

            const companydata = await eventRepositories.findPastBookingDataForDashboard(company._id)
            const companyda = companydata.map(curr => {
                const schedules = curr.schedules.map(schedule => {
                    const totalTickets =
                        schedule.prime_seats +
                        schedule.golden_seats +
                        schedule.clasic_seats;

                    const ticketsSold =
                        (schedule.prime_seats_book?.length || 0) +
                        (schedule.golden_seats_book?.length || 0) +
                        (schedule.classic_seats_book?.length || 0);

                    const revenue =
                        (schedule.prime_seats_book?.length || 0) * schedule.prime_ticket_price +
                        (schedule.golden_seats_book?.length || 0) * schedule.golden_ticket_price +
                        (schedule.classic_seats_book?.length || 0) * schedule.clasic_ticket_price;

                    return {
                        Date: schedule.date,
                        Time: `${schedule.start_time} - ${schedule.end_time}`,
                        Tickets: totalTickets,
                        Tickets_Sold: ticketsSold,
                        Revenue: revenue
                    };
                });

                return {
                    event_id: curr._id,
                    Event: curr.movie_details?.name || 'Unknown',
                    Date_time: schedules
                };
            });
            console.log(JSON.stringify(companydata, null, 2));

            if (!companyexist.isverify) {
                req.flash('warning', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            return res.render('organizer/dashbord/Events/eventstable', {
                title: 'Event Table - BookMyTicket', companyda,user:company
            });
        } catch (error) {
            console.log(error);
            req.flash('warning', 'Something went wrong.');
            return res.redirect('/organizer/dashboard');
        }
    }
    async show_reject_events(req, res) {
        try {
            const company = req.organizer;
            const email = company.email;
            const companyexist = await organizerRepositories.find(email);

            const companydata = await eventRepositories.rejectfinbbookingdatafordashboard(company._id)
            const companyda = companydata.map(curr => {
                const schedules = curr.schedules.map(schedule => {
                    const totalTickets =
                        schedule.prime_seats +
                        schedule.golden_seats +
                        schedule.clasic_seats;

                    const ticketsSold =
                        (schedule.prime_seats_book?.length || 0) +
                        (schedule.golden_seats_book?.length || 0) +
                        (schedule.classic_seats_book?.length || 0);

                    const revenue =
                        (schedule.prime_seats_book?.length || 0) * schedule.prime_ticket_price +
                        (schedule.golden_seats_book?.length || 0) * schedule.golden_ticket_price +
                        (schedule.classic_seats_book?.length || 0) * schedule.clasic_ticket_price;

                    return {
                        Date: schedule.date,
                        Time: `${schedule.start_time} - ${schedule.end_time}`,
                        Tickets: totalTickets,
                        Tickets_Sold: ticketsSold,
                        Revenue: revenue
                    };
                });

                return {
                    event_id: curr._id,
                    Event: curr.movie_details?.name || 'Unknown',
                    Date_time: schedules,
                     status:curr.status,
                    adminreject_msg:curr.adminreject_msg,
                };
            });
            console.log(JSON.stringify(companydata, null, 2));

            if (!companyexist.isverify) {
                req.flash('warning', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            return res.render('organizer/dashbord/Events/reject_movie_list.ejs', {
                title: 'Event Table - BookMyTicket', companyda,user:company
            });
        } catch (error) {
            console.log(error);
            req.flash('warning', 'Something went wrong.');
            return res.redirect('/organizer/dashboard');
        }
    }
    async show_events_single(req, res) {
        try {
            const id = req.params.id
            const company = req.organizer;
            const email = company.email;
            const companyexist = await organizerRepositories.find(email);

            const companydata = await eventRepositories.finbbookingdataforsingle(id)

            console.log(JSON.stringify(companydata, null, 2));

            if (!companyexist.isverify) {
                req.flash('warning', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            return res.render('organizer/dashbord/Events/eventsingle', {
                title: 'Event Table - BookMyTicket', data: companydata,user:company
            });
        } catch (error) {
            console.log(error);
            req.flash('warning', 'Something went wrong.');
            return res.redirect('/organizer/dashboard');
        }
    }
    async show_events_single_del(req, res) {
        try {
            const id = req.params.id
            const user = req.organizer
            const email = user.email
            const companyexist = await organizerRepositories.find(email);

            const companydata = await eventRepositories.bookingdataforsingledelete(id)

            console.log(JSON.stringify(companydata, null, 2));

            if (!companyexist.isverify) {
                req.flash('warning', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            if (companydata) {
                req.flash('success', `Movie Detete Succcessfully`);
                return res.redirect(`/organizer/events`);
            }
        } catch (error) {
            console.log(error);
            req.flash('warning', 'Something went wrong.');
            return res.redirect('/organizer/dashboard');
        }
    }
    async add_event(req, res) {
        try {

            const company = req.organizer;
            console.log(company)
            const email = company.email;
            const companyexist = await organizerRepositories.find(email);
            const movies = await adminMovieRepo.moviedatadindwithid();

            if (!companyexist.isverify) {
                req.flash('warning', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            return res.render('organizer/dashbord/Events/addevents', {
                title: 'Add Event - BookMyTicket',
                movies,user:company
            });
        } catch (error) {
            console.log(error);
            req.flash('warning', 'Something went wrong.');
            return res.redirect('/organizer/events');
        }
    }
    async add_event_data(req, res) {
        try {
            const user = req.organizer;

            // Parse schedules if it's a JSON string
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }

            // Joi Schema
            const Joi = require('joi');

            const schema = Joi.object({
                movie_id: Joi.string()
                    .pattern(/^[0-9a-fA-F]{24}$/)
                    .required()
                    .messages({
                        'string.pattern.base': 'movie_id must be a valid ObjectId',
                        'any.required': 'movie_id is required',
                    }),

                msg: Joi.string().allow('', null),

                schedules: Joi.array()
                    .items(
                        Joi.object({
                            date: Joi.date().required().messages({
                                'any.required': 'Schedule date is required',
                            }),
                            start_time: Joi.string().required().messages({
                                'any.required': 'Start time is required',
                            }),
                            end_time: Joi.string().required().messages({
                                'any.required': 'End time is required',
                            }),
                            screen: Joi.string().required().messages({
                                'any.required': 'Screen is required',
                            }),
                            language: Joi.string().required().messages({
                                'any.required': 'Language is required',
                            }),
                            format: Joi.array()
                                .items(
                                    Joi.string().valid(
                                        '2D',
                                        '3D',
                                        'IMAX 2D',
                                        'IMAX 3D',
                                        '4DX',
                                        'Dolby Atmos',
                                        'Dolby Cinema',
                                        'ScreenX',
                                        'MX4D',
                                        'D-BOX',
                                        'Subtitled'
                                    )
                                )
                                .min(1)
                                .required()
                                .messages({
                                    'any.required': 'Format is required',
                                    'array.min': 'At least one format must be selected',
                                }),
                            prime_ticket_price: Joi.number().min(0).required().messages({
                                'any.required': 'Prime ticket price is required',
                                'number.min': 'Prime ticket price must be non-negative',
                            }),
                            golden_ticket_price: Joi.number().min(0).required().messages({
                                'any.required': 'Golden ticket price is required',
                                'number.min': 'Golden ticket price must be non-negative',
                            }),
                            clasic_ticket_price: Joi.number().min(0).required().messages({
                                'any.required': 'Classic ticket price is required',
                                'number.min': 'Classic ticket price must be non-negative',
                            }),
                            prime_seats: Joi.number().integer().min(0).required().messages({
                                'any.required': 'Prime seats are required',
                                'number.min': 'Prime seats must be non-negative',
                            }),
                            golden_seats: Joi.number().integer().min(0).required().messages({
                                'any.required': 'Golden seats are required',
                                'number.min': 'Golden seats must be non-negative',
                            }),
                            clasic_seats: Joi.number().integer().min(0).required().messages({
                                'any.required': 'Classic seats are required',
                                'number.min': 'Classic seats must be non-negative',
                            }),
                        })
                    )
                    .min(1)
                    .required()
                    .messages({
                        'array.base': 'Schedules must be an array',
                        'any.required': 'Schedules are required',
                        'array.min': 'At least one schedule is required',
                    }),
            });


            // Validate
            const { error } = schema.validate(req.body, { abortEarly: false });

            if (error) {
                req.flash('warning', error.details.map((err) => err.message));
                return res.redirect('/organizer/add_event');
            }

            // Create event data
            const newEvent = {
                company_id: user._id,
                movie_id: req.body.movie_id,
                msg: req.body.msg || '',
                schedules: req.body.schedules,
            };

            const data = await eventrepo.adddata(newEvent);

            req.flash('success', 'Event added successfully!');
            return res.redirect('/organizer/events');

        } catch (error) {
            console.error(error);
            req.flash('warning', 'Something went wrong. Please try again.');
            return res.redirect('/organizer/add_event');
        }
    }
    async edit_event_data_store(req, res) {
        try {
            const user = req.organizer;
            const id = req.params.id
            // Parse schedules if it's a JSON string
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }

            // Joi Schema
            const Joi = require('joi');

            const schema = Joi.object({
                movie_id: Joi.string()
                    .pattern(/^[0-9a-fA-F]{24}$/)
                    .required()
                    .messages({
                        'string.pattern.base': 'movie_id must be a valid ObjectId',
                        'any.required': 'movie_id is required',
                    }),

                msg: Joi.string().allow('', null),

                schedules: Joi.array()
                    .items(
                        Joi.object({
                            date: Joi.date().required().messages({
                                'any.required': 'Schedule date is required',
                            }),
                            start_time: Joi.string().required().messages({
                                'any.required': 'Start time is required',
                            }),
                            end_time: Joi.string().required().messages({
                                'any.required': 'End time is required',
                            }),
                            screen: Joi.string().required().messages({
                                'any.required': 'Screen is required',
                            }),
                            language: Joi.string().required().messages({
                                'any.required': 'Language is required',
                            }),
                            format: Joi.array()
                                .items(
                                    Joi.string().valid(
                                        '2D',
                                        '3D',
                                        'IMAX 2D',
                                        'IMAX 3D',
                                        '4DX',
                                        'Dolby Atmos',
                                        'Dolby Cinema',
                                        'ScreenX',
                                        'MX4D',
                                        'D-BOX',
                                        'Subtitled'
                                    )
                                )
                                .min(1)
                                .required()
                                .messages({
                                    'any.required': 'Format is required',
                                    'array.min': 'At least one format must be selected',
                                }),
                            prime_ticket_price: Joi.number().min(0).required().messages({
                                'any.required': 'Prime ticket price is required',
                                'number.min': 'Prime ticket price must be non-negative',
                            }),
                            golden_ticket_price: Joi.number().min(0).required().messages({
                                'any.required': 'Golden ticket price is required',
                                'number.min': 'Golden ticket price must be non-negative',
                            }),
                            clasic_ticket_price: Joi.number().min(0).required().messages({
                                'any.required': 'Classic ticket price is required',
                                'number.min': 'Classic ticket price must be non-negative',
                            }),
                            prime_seats: Joi.number().integer().min(0).required().messages({
                                'any.required': 'Prime seats are required',
                                'number.min': 'Prime seats must be non-negative',
                            }),
                            golden_seats: Joi.number().integer().min(0).required().messages({
                                'any.required': 'Golden seats are required',
                                'number.min': 'Golden seats must be non-negative',
                            }),
                            clasic_seats: Joi.number().integer().min(0).required().messages({
                                'any.required': 'Classic seats are required',
                                'number.min': 'Classic seats must be non-negative',
                            }),
                        })
                    )
                    .min(1)
                    .required()
                    .messages({
                        'array.base': 'Schedules must be an array',
                        'any.required': 'Schedules are required',
                        'array.min': 'At least one schedule is required',
                    }),
            });


            // Validate
            const { error } = schema.validate(req.body, { abortEarly: false });

            if (error) {
                req.flash('warning', error.details.map((err) => err.message));
                return res.redirect('/organizer/add_event');
            }

            // Create event data
            const newEvent = {
                company_id: user._id,
                movie_id: req.body.movie_id,
                msg: req.body.msg || '',
                schedules: req.body.schedules,
            };

            const data = await eventrepo.editdata(id, newEvent);
            if (data) {
                req.flash('success', 'Event Edit successfully!');
                return res.redirect('/organizer/events');
            }


        } catch (error) {
            console.error(error);
            req.flash('warning', 'Something went wrong. Please try again.');
            return res.redirect('/organizer/add_event');
        }
    }
    async edit_event_data(req, res) {
        try {
            const company = req.organizer;
            const id = req.params.id
            const eventData = await eventrepo.findbyiddata(id)
            const movies = await adminMovieRepo.moviedatadindwithid();
            const email = company.email;
            const companyexist = await organizerRepositories.find(email);


            if (!companyexist.isverify) {
                req.flash('warning', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            return res.render('organizer/dashbord/Events/edit_event', {
                title: 'Add Event - BookMyTicket',
                eventData, movies,user:company
            });
        } catch (error) {
            console.log(error);
            req.flash('warning', 'Something went wrong.');
            return res.redirect('/organizer/events');
        }
    }
}

module.exports = new organizerEventController();
