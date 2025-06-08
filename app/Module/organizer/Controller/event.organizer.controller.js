
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
const eventOrganizerRepositories = require('../Repositories/event.organizer.repositories');
const { eventSchema } = require('../../../Helper/joivalidation');




class eventorganizerController {

    async show_events(req, res) {
        try {
            const user = req.organizer;
            const email = user.email;
            const companyexist = await organizerRepositories.find(email);

            if (!companyexist.isverify) {
                req.flash('error', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }
            const eventdata = await eventOrganizerRepositories.shoalldata(user._id)
            const companyda = eventdata.map(curr => {
                const schedules = curr.schedules.map(schedule => {
                    const totalTickets =
                        schedule.prime_seats +
                        schedule.golden_seats +
                        schedule.clasic_seats;

                    const availablePrime = schedule.avl_prime_seats ? schedule.avl_prime_seats : 0;
                    const availableGolden = schedule.avl_golden_seats ? schedule.avl_golden_seats : 0;
                    const availableClassic = schedule.avl_classic_seats ? schedule.avl_classic_seats : 0;


                    const soldPrime = schedule.prime_seats - availablePrime;
                    const soldGolden = schedule.golden_seats - availableGolden;
                    const soldClassic = schedule.clasic_seats - availableClassic;

                    const ticketsSold = soldPrime + soldGolden + soldClassic;

                    const revenue =
                        soldPrime * schedule.prime_ticket_price +
                        soldGolden * schedule.golden_ticket_price +
                        soldClassic * schedule.clasic_ticket_price;

                    return {
                        Date: schedule.date,
                        Time: `${schedule.start_time} - ${schedule.end_time}`,
                        Tickets: totalTickets,
                        Tickets_Sold: ticketsSold,
                        Revenue: revenue,
                        location: schedule.location
                    };
                });

                return {
                    event_id: curr._id,
                    Event: curr.event_name || 'Unknown',
                    category: curr.category,
                    status:curr.status,
                    Date_time: schedules
                };
            });

            console.log(JSON.stringify(companyda, null, 2));
            // console.log(JSON.stringify(eventdata, null, 2));

            return res.render('organizer/events/crud/event_table', {
                title: 'Event Table - BookMyTicket', companyda, user
            });
        } catch (error) {
            console.log(error);
            req.flash('error', 'Something went wrong.');
            return res.redirect('/organizer/dashboard');
        }
    }
    async reject_show_events(req, res) {
        try {
            const user = req.organizer;
            const email = user.email;
            const companyexist = await organizerRepositories.find(email);

            if (!companyexist.isverify) {
                req.flash('error', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }
            const eventdata = await eventOrganizerRepositories.shoalldatareject(user._id)
            const companyda = eventdata.map(curr => {
                const schedules = curr.schedules.map(schedule => {
                    const totalTickets =
                        schedule.prime_seats +
                        schedule.golden_seats +
                        schedule.clasic_seats;

                    const availablePrime = schedule.avl_prime_seats ? schedule.avl_prime_seats : 0;
                    const availableGolden = schedule.avl_golden_seats ? schedule.avl_golden_seats : 0;
                    const availableClassic = schedule.avl_classic_seats ? schedule.avl_classic_seats : 0;


                    const soldPrime = schedule.prime_seats - availablePrime;
                    const soldGolden = schedule.golden_seats - availableGolden;
                    const soldClassic = schedule.clasic_seats - availableClassic;

                    const ticketsSold = soldPrime + soldGolden + soldClassic;

                    const revenue =
                        soldPrime * schedule.prime_ticket_price +
                        soldGolden * schedule.golden_ticket_price +
                        soldClassic * schedule.clasic_ticket_price;

                    return {
                        Date: schedule.date,
                        Time: `${schedule.start_time} - ${schedule.end_time}`,
                        Tickets: totalTickets,
                        Tickets_Sold: ticketsSold,
                        Revenue: revenue,
                        location: schedule.location
                    };
                });

                return {
                    event_id: curr._id,
                    Event: curr.event_name || 'Unknown',
                    category: curr.category,
                    status:curr.status,
                    adminreject_msg:curr.adminreject_msg,
                    Date_time: schedules
                };
            });

            console.log(JSON.stringify(companyda, null, 2));
            // console.log(JSON.stringify(eventdata, null, 2));

            return res.render('organizer/events/crud/reject_event_teble', {
                title: 'Event Table - BookMyTicket', companyda, user
            });
        } catch (error) {
            console.log(error);
            req.flash('error', 'Something went wrong.');
           
        }
    }
    async add_event(req, res) {
        try {

            const user = req.organizer;
            console.log(user)
            const email = user.email;
            const companyexist = await organizerRepositories.find(email);
            const movies = await adminMovieRepo.moviedatadindwithid();

            if (!companyexist.isverify) {
                req.flash('error', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            return res.render('organizer/events/crud/add_event', {
                title: 'Add Event - BookMyTicket', user,
                movies
            });
        } catch (error) {
            console.log(error);
            req.flash('error', 'Something went wrong.');
            return res.redirect('/organizer/events');
        }
    }
    async event_single_details(req, res) {
        try {
            const id = req.params.id
            const company = req.organizer;
            console.log(company)
            const email = company.email;
            const companyexist = await organizerRepositories.find(email);
            const eventdata = await eventOrganizerRepositories.findallcompanybyidsingledashboard(id)
            // console.log(JSON.stringify(eventdata, null, 2));

            if (!companyexist.isverify) {
                req.flash('error', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }

            return res.render('organizer/events/crud/singleevent', {
                title: 'Add Event - BookMyTicket', eventdata, user: req.organizer

            });
        } catch (error) {
            console.log(error);
            req.flash('error', 'Something went wrong.');
            return res.redirect('/organizer/events');
        }
    }
    async add_event_data(req, res) {
        try {
            console.log(req.body)
            console.log(req.files)
            // 1. Validate with Joi
            const { error, value } = eventSchema.validate(req.body, { abortEarly: false });
            if (error) {
                req.flash('error', error.details.map(e => e.message).join(', '));
                return res.redirect('/organizer/event/create');
            }


            // 2. Get organizer company from req
            const company = req.organizer;
            const company_id = company._id;

            // 3. Destructure validated values
            const {
                event_name,
                category,
                description,
                validAge,
                artistname = [],
                artistrole = [],
                venue = [],
                city = [],
                date = [],
                start_time = [],
                end_time = [],
                screen = [],
                language = [],
                format = [],
                prime_ticket_price = [],
                golden_ticket_price = [],
                clasic_ticket_price = [],
                prime_seats = [],
                golden_seats = [],
                clasic_seats = [],
            } = value;

            const images = req.files?.images?.map(file => file.filename) || [];
            const videos = req.files?.videos?.map(file => file.filename) || [];
            const artistImages = req.files?.artistimage?.map(file => file.filename) || [];

            // 5. Prepare artist array
            const artist = artistname.map((name, index) => ({
                artistname: name,
                artistrole: artistrole[index],
                artistimage: artistImages[index] || '',
            }));

            // 6. Prepare schedule array
            const schedules = venue.map((v, i) => ({
                location: {
                    venue: v,
                    city: city[i],
                },
                date: new Date(date[i]),
                start_time: start_time[i],
                end_time: end_time[i],
                screen: screen[i],
                language: language[i],
                format: format[i]?.split(',').map(f => f.trim()), // ensure it's an array
                prime_ticket_price: parseFloat(prime_ticket_price[i]),
                golden_ticket_price: parseFloat(golden_ticket_price[i]),
                clasic_ticket_price: parseFloat(clasic_ticket_price[i]),
                prime_seats: parseInt(prime_seats[i]),
                golden_seats: parseInt(golden_seats[i]),
                clasic_seats: parseInt(clasic_seats[i]),
                avl_prime_seats: parseInt(prime_seats[i]),
                avl_golden_seats: parseInt(golden_seats[i]),
                avl_classic_seats: parseInt(clasic_seats[i]),
            }));

            // 7. Final event object
            const newEvent = {
                event_name,
                company_id,
                images, videos,
                description,
                category,
                artist,
                validAge: validAge === 'true' || validAge === true,
                schedules,
                type: 'event'
            };

            // 8. Save to DB
            const data = await eventOrganizerRepositories.adddata(newEvent);
            if (data) {

                req.flash('success', 'Event created successfully!');
                return res.redirect('/organizer/events-table');
            }

        } catch (error) {
            console.log(error);
            req.flash('error', 'Something went wrong. Please try again.');
            return res.redirect('/organizer/event/create');
        }
    }
    async edit_event(req, res) {
        try {
            const user = req.organizer;
            const id = req.params.id

            const data = await eventOrganizerRepositories.findbyiddata(id);
            // console.log(JSON.stringify(data, null, 2))
            return res.render('organizer/events/crud/edit_event', {
                title: 'Add Event - BookMyTicket', user: req.organizer,
                event: data
            });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Something went wrong. Please try again.');
            return res.redirect('/organizer/add_event');
        }
    }
    async edit_event_data(req, res) {
        try {
            const id = req.params.id;
            console.log(req.body);
            console.log(req.files);

            // 1. Validate with Joi
            const { error, value } = eventSchema.validate(req.body, { abortEarly: false });
            if (error) {
                req.flash('error', error.details.map(e => e.message).join(', '));
                return res.redirect('/organizer/event/create');
            }

            // 2. Get organizer company from req
            const company = req.organizer;
            const company_id = company._id;

            // 3. Destructure validated values
            const {
                event_name,
                category,
                description,
                validAge,
                artistname = [],
                artistrole = [],
                venue = [],
                city = [],
                date = [],
                start_time = [],
                end_time = [],
                screen = [],
                language = [],
                format = [],
                prime_ticket_price = [],
                golden_ticket_price = [],
                clasic_ticket_price = [],
                prime_seats = [],
                golden_seats = [],
                clasic_seats = [],
            } = value;

            const images = req.files?.images?.map(file => file.filename) || [];
            const videos = req.files?.videos?.map(file => file.filename) || [];
            const artistImages = req.files?.artistimage?.map(file => file.filename) || [];

            // 4. Prepare artist array
            const artist = artistname.map((name, index) => ({
                artistname: name,
                artistrole: artistrole[index],
                artistimage: artistImages[index] || '',
            }));

            // 5. Fetch existing event to calculate seat differences
            const existingEvent = await eventOrganizerRepositories.findallcompanybyid(id);
            const oldSchedules = existingEvent?.schedules || [];

            // 6. Create new schedules with seat differences
            const schedules = venue.map((v, i) => {
                const oldSchedule = oldSchedules[i] || {};

                const new_prime = parseInt(prime_seats[i]);
                const new_golden = parseInt(golden_seats[i]);
                const new_clasic = parseInt(clasic_seats[i]);

                const old_prime = oldSchedule.prime_seats || 0;
                const old_golden = oldSchedule.golden_seats || 0;
                const old_clasic = oldSchedule.clasic_seats || 0;

                const old_avl_prime = oldSchedule.avl_prime_seats || 0;
                const old_avl_golden = oldSchedule.avl_golden_seats || 0;
                const old_avl_clasic = oldSchedule.avl_classic_seats || 0;

                const delta_prime = new_prime - old_prime;
                const delta_golden = new_golden - old_golden;
                const delta_clasic = new_clasic - old_clasic;

                return {
                    location: {
                        venue: v,
                        city: city[i],
                    },
                    date: new Date(date[i]),
                    start_time: start_time[i],
                    end_time: end_time[i],
                    screen: screen[i],
                    language: language[i],
                    format: format[i]?.split(',').map(f => f.trim()),
                    prime_ticket_price: parseFloat(prime_ticket_price[i]),
                    golden_ticket_price: parseFloat(golden_ticket_price[i]),
                    clasic_ticket_price: parseFloat(clasic_ticket_price[i]),
                    prime_seats: new_prime,
                    golden_seats: new_golden,
                    clasic_seats: new_clasic,
                    avl_prime_seats: old_avl_prime + delta_prime,
                    avl_golden_seats: old_avl_golden + delta_golden,
                    avl_classic_seats: old_avl_clasic + delta_clasic,
                };
            });

            // 7. Prepare event object
            let newEvent = {
                event_name,
                company_id,
                description,
                category,
                validAge: validAge === 'true' || validAge === true,
                schedules,
            };

            if (images.length > 0) newEvent.images = images;
            if (videos.length > 0) newEvent.videos = videos;
            if (artist.length > 0) newEvent.artist = artist;

            // 8. Update event
            const data = await eventOrganizerRepositories.findbyidandupdatedata(id, newEvent);
            if (data) {
                req.flash('success', `Event updated successfully`);
                return res.redirect(`/organizer/events-table`);
            }

        } catch (error) {
            console.log(error);
            req.flash('error', 'Something went wrong.');
            return res.redirect('/organizer/events-table');
        }
    }
    async show_events_single_del(req, res) {
        try {
            const id = req.params.id
            console.log(id);

            const user = req.organizer
            const email = user.email
            const companyexist = await organizerRepositories.find(email);



            // console.log(JSON.stringify(companydata,null,2));

            if (!companyexist.isverify) {
                req.flash('error', `Please Change Your Password First`);
                return res.redirect(`/organizer/change-password`);
            }
            const companydata = await eventOrganizerRepositories.bookingdataforsingledelete(id)
            if (companydata) {
                req.flash('success', `Movie Detete Succcessfully`);
                return res.redirect(`/organizer/events-table`);
            }
        } catch (error) {
            console.log(error);
            req.flash('error', 'Something went wrong.');
            return res.redirect('/organizer/dashboard');
        }
    }
}

module.exports = new eventorganizerController();
