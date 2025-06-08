const crypto = require('crypto');
const Razorpay = require("razorpay");
const ticketRepositories = require("../repositories/ticket.repositories");
const eventRepositories = require('../../organizer/Repositories/event.repositories');
const eventOrganizerRepositories = require('../../organizer/Repositories/event.organizer.repositories');
const { generateQRCode } = require('../../../Helper/qrcode');
const { log } = require('console');
const organizerRepositories = require('../../organizer/Repositories/organizer.repositories');

require('dotenv').config();
const razorpayInstance = new Razorpay({
    key_id: process.env.APIKEY,
    key_secret: process.env.SERECTKEY,
});
class TicketController {
    async payment_create(req, res) {
        try {
            const { amount } = req.body;
            console.log(req.body)
            if (!amount || isNaN(amount) || amount < 100) {
                return res.status(400).json({ error: "Invalid amount. Must be at least ₹1 (100 paise)." });
            }

            const options = {
                amount: amount,
                currency: "INR",
                payment_capture: 1
            };

            const order = await razorpayInstance.orders.create(options);
            res.json(order);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Unable to create order' });
        }
    }
    async ticketshow(req, res) {
        try {
            const user = req.user
            const id = req.params.id;
            const data = await ticketRepositories.findticketdetailsbyid(id)
            // console.log(data)
            let eventdata;
            let ticketDat;
            if (data.organizerevent_id) {
                eventdata = await eventOrganizerRepositories.findallcompanybyid(data.organizerevent_id)
                // console.log(eventdata)
                const companydata = await organizerRepositories.findallcompanybyid(eventdata.company_id);
                //   console.log(eventdata);
                ticketDat = {
                    showname: data.moviename,
                    showDate: new Date(data.moviedate),
                    showTime: data.movietime,
                    venue: companydata.company_name,
                    add: companydata.address,
                    seats: [data.seat.prime_seats[0], data.seat.golden_seats[0], data.seat.classic_seats[0]],
                    ticketId: data._id,
                    noOfTicketsBought: data.noOfTicketsBought,
                    eventPosterUrl: eventdata.images[0],
                    ismovie: false
                }
            } else {
                eventdata = await eventRepositories.findbyiddataforemail(data.event_id)
                const companydata = await organizerRepositories.findallcompanybyid(eventdata.company_id);
                ticketDat = {
                    showname: data.moviename,
                    showDate: new Date(data.moviedate),
                    showTime: data.movietime,
                    venue: companydata.company_name,
                    add: companydata.address,
                    seats: [data.seat.prime_seats[0], data.seat.golden_seats[0], data.seat.classic_seats[0]],
                    ticketId: data._id,
                    noOfTicketsBought: data.noOfTicketsBought,
                    eventPosterUrl: eventdata.movie_id.posters[0],
                    ismovie: true
                }
            }
            const companyLogoUrl = '/images-removebg-preview.png';
            const eventPosterUrl = '/image.jpg';
            const qrCodeDataUrl = await generateQRCode(ticketDat)
            console.log(ticketDat);

            return res.render('user_pages/ticket/ticket', { ticketData: ticketDat, companyLogoUrl, eventPosterUrl, user, qrCodeDataUrl })
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Unable to create order' });
        }
    }

    // async pdfwownlode_ticket(req, res) {
    //     try {
    //         const ticketId = req.params.ticketId;

    //         // Dummy ticket data (replace with your DB fetch)
    //         const ticketData = {
    //             showname: 'Avengers: Endgame',
    //             showDate: '31-05-2025',
    //             showTime: '7:00 PM',
    //             venue: 'IMAX Cinema Hall',
    //             seats: ['A1', 'A2', 'A3'],
    //             ticketId,
    //             companyLogoPath: path.join(__dirname, '../public/images/company-logo.png'),
    //             eventPosterPath: path.join(__dirname, '../public/images/avengers-poster.jpg')
    //         };


    //         const doc = new PDFDocument({ size: 'A4', margin: 50 });

    //         // Set response headers
    //         res.setHeader('Content-Disposition', `attachment; filename=${ticketData.showname}-ticket.pdf`);
    //         res.setHeader('Content-Type', 'application/pdf');

    //         // Pipe PDF stream to response
    //         doc.pipe(res);

    //         // Company Logo (top left)
    //         if (fs.existsSync(ticketData.companyLogoPath)) {
    //             doc.image(ticketData.companyLogoPath, 50, 50, { width: 100 });
    //         }

    //         // Title
    //         doc.fontSize(20).fillColor('#1e2a78').text('Movie Ticket', 200, 65);

    //         // Event Poster (top right)
    //         if (fs.existsSync(ticketData.eventPosterPath)) {
    //             doc.image(ticketData.eventPosterPath, 400, 50, { width: 120 });
    //         }

    //         // Ticket details
    //         doc.moveDown(4);
    //         doc.fontSize(16).fillColor('black').text(`Movie: ${ticketData.showname}`, { underline: true });
    //         doc.moveDown(0.5);
    //         doc.fontSize(14).text(`Date: ${ticketData.showDate}`);
    //         doc.text(`Time: ${ticketData.showTime}`);
    //         doc.text(`Venue: ${ticketData.venue}`);
    //         doc.text(`Seats: ${ticketData.seats.join(', ')}`);
    //         doc.text(`Ticket ID: ${ticketData.ticketId}`);

    //         // Generate QR code PNG buffer from ticket info JSON
    //         const qrPngBuffer = qr.imageSync(JSON.stringify(ticketData), { type: 'png' });

    //         // Draw QR code
    //         doc.image(qrPngBuffer, 50, 300, { width: 150 });

    //         // Footer note
    //         doc.fontSize(10).fillColor('gray')
    //             .text('Please present this ticket at entry. Valid ID required. Enjoy your movie!', 50, 500, {
    //                 align: 'center',
    //                 width: 500
    //             });

    //         // Finalize PDF
    //         doc.end();

    //     } catch (err) {
    //         console.log(err);
    //         res.status(500).json({ error: 'Unable to create order' });
    //     }
    // }

    async createTicketformovie(req, res) {
        try {

            const { paymentDetails, bookingData } = req.body
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
            console.log('body', req.body)
            // console.log(paymentDetails)
            // console.log(bookingData)
            const secret = process.env.SERECTKEY
            const generated_signature = crypto.createHmac('sha256', secret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');

            if (generated_signature !== razorpay_signature) {
                return res.status(400).json({ success: false, message: 'Invalid signature' });
            }


            const normalizedSeats = {
                prime_seats: (bookingData.selectedSeats.prime || []).map(seat => parseInt(seat.split('-')[1])),
                golden_seats: (bookingData.selectedSeats.golden || []).map(seat => parseInt(seat.split('-')[1])),
                classic_seats: (bookingData.selectedSeats.classic || []).map(seat => parseInt(seat.split('-')[1])),
            };
            const movieDate = new Date(bookingData.date); // "2025-06-01"
            movieDate.setUTCHours(18, 30, 0, 0);
            const newTicket = {
                event_id: bookingData.event_id,
                user_id: req.user._id, // assuming you're using middleware to set this
                seat: normalizedSeats,
                shedule_id: bookingData.id,
                totalPayment: bookingData.totalAmount,
                noOfTicketsBought: bookingData.ticketCount,
                moviename: bookingData.title,
                movietime: bookingData.time,
                moviedate: movieDate.toISOString(),
                movieimage: bookingData.image,
                ismovie: true,
                paymentDetails: {
                    razorpay_payment_id: paymentDetails.razorpay_payment_id,
                    razorpay_order_id: paymentDetails.razorpay_order_id,
                    razorpay_signature: paymentDetails.razorpay_signature
                }
            }
            console.log('hello', newTicket);
            const ticketdata = await ticketRepositories.datasave(newTicket);
            if (ticketdata) {
                const uutseat = await eventRepositories.updateseate(normalizedSeats, bookingData.id)
                if (uutseat) {
                    return res.status(200).json({ success: true, message: 'Payment conformed', id: ticketdata._id });
                    // req.flash('success',"payment Success")
                    // return res.redirect(`/ticket/${ticketdata._id}`)
                }
                return res.status(400).json({ success: false, message: 'Pyment Not conformed' });

            }
            return res.status(400).json({ success: false, message: 'Pyment Not conformed wait some time ' });

        } catch (error) {

            console.log(error);
        }
    }
    async createTicketforevent(req, res) {
        try {

            const { paymentDetails, bookingData } = req.body
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
            console.log('body', req.body)
            // console.log(paymentDetails)
            // console.log(bookingData)
            const secret = process.env.SERECTKEY
            const generated_signature = crypto.createHmac('sha256', secret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest('hex');

            if (generated_signature !== razorpay_signature) {
                return res.status(400).json({ success: false, message: 'Invalid signature' });
            }


            const seatData = {
                prime_seats: bookingData.selectedSeats.prime ? [bookingData.selectedSeats.prime] : [],
                golden_seats: bookingData.selectedSeats.golden ? [bookingData.selectedSeats.golden] : [],
                classic_seats: bookingData.selectedSeats.classic ? [bookingData.selectedSeats.classic] : []
            };
            const countseat =
                (bookingData.selectedSeats.prime || 0) +
                (bookingData.selectedSeats.golden || 0) +
                (bookingData.selectedSeats.classic || 0);
            const movieDate = new Date(bookingData.showDate); // e.g., "2025-06-01"
            movieDate.setUTCHours(18, 30, 0, 0); // Set to 18:30 UTC

            const newTicket = {
                organizerevent_id: bookingData.eventId,
                user_id: req.user._id,
                seat: seatData,
                shedule_id: bookingData.sheduleId,
                totalPayment: bookingData.total,
                noOfTicketsBought: countseat,
                ismovie: false,
                moviename: bookingData.showTitle,
                moviedate: movieDate.toISOString(), // => "2025-06-01T18:30:00.000Z"
                movietime: bookingData.showTime, // => "2025-06-01" (only date part)
                movieimage: bookingData.image,
                paymentDetails: {
                    razorpay_payment_id: paymentDetails.razorpay_payment_id,
                    razorpay_order_id: paymentDetails.razorpay_order_id,
                    razorpay_signature: paymentDetails.razorpay_signature
                }
            }

            console.log('hello', newTicket, "gggg");
            const ticketdata = await ticketRepositories.datasave(newTicket);

            if (ticketdata) {
                const uutseat = await eventOrganizerRepositories.updateSeatsByCount(bookingData.selectedSeats, bookingData.sheduleId)
                if (uutseat) {
                    return res.status(200).json({ success: true, message: 'Payment conformed', id: ticketdata._id });
                    // req.flash('success',"payment Success")
                    // return res.redirect(`/ticket/${ticketdata._id}`)
                }
                return res.status(400).json({ success: false, message: 'Payment Not conformed' });

            }
            return res.status(400).json({ success: false, message: 'Payment Not conformed wait some time ' });

        } catch (error) {

            console.log(error);
        }
    }
    async getTicketStatsforuserdashboard(id) {
        try {
            const now = new Date();

            const tickets = await Ticket.find({ user_id: id, ismovie: true })
                .populate({
                    path: "event_id",
                    populate: { path: "movie_id" }
                });

            let ticketsBooked = tickets.length;
            let amountSpent = 0;
            let upcomingEventsMap = new Map();
            let pastEventsMap = new Map();

            for (const ticket of tickets) {
                amountSpent += ticket.totalPayment || 0;

                const event = ticket.event_id;
                if (!event || !event.schedules) continue;

                const matchedSchedule = event.schedules.find(s =>
                    s._id.toString() === ticket.shedule_id?.toString()
                );
                if (!matchedSchedule) continue;

                const scheduleDate = new Date(matchedSchedule.date);
                const movie = event.movie_id;

                const eventData = {
                    _id: event._id,
                    title: movie?.name || "Untitled",
                    date: scheduleDate.toISOString().split("T")[0],
                    ...(scheduleDate >= now
                        ? {
                            description: movie?.description?.slice(0, 80) + "...",
                            image: movie?.posters?.[0] || "",
                        }
                        : {})
                };

                if (scheduleDate >= now) {
                    upcomingEventsMap.set(event._id.toString(), eventData);
                } else {
                    pastEventsMap.set(event._id.toString(), eventData);
                }
            }

            return {
                stats: {
                    ticketsBooked,
                    upcomingEvents: upcomingEventsMap.size,
                    amountSpent: parseFloat(amountSpent.toFixed(2)),
                },
                upcomingEvents: Array.from(upcomingEventsMap.values()),
                pastEvents: Array.from(pastEventsMap.values()),
            };

        } catch (err) {
            console.error("Error in getTicketStatsforuserdashboard:", err);
            return { stats: {}, upcomingEvents: [], pastEvents: [] };
        }
    }

}

module.exports = new TicketController();