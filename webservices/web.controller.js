const { default: mongoose } = require("mongoose")
const adminArtistRepo = require("../app/Module/admin/Repositories/admin.artist.repo")
const adminMovieRepo = require("../app/Module/admin/Repositories/admin.movie.repo")
const eventOrganizerRepositories = require("../app/Module/organizer/Repositories/event.organizer.repositories")
const eventRepositories = require("../app/Module/organizer/Repositories/event.repositories")
const organizerRepositories = require("../app/Module/organizer/Repositories/organizer.repositories")
const userRepositories = require("../app/Module/user/Repositories/user.repositories")

class WebController {
    // home page
    async home(req, res) {
        try {
            const movie = await userRepositories.testimonialdatafind_populer_movie()
            const { popularmovie, popularevent } = movie
            // console.log(movie);
            const newrelishedmovie = await adminMovieRepo.getNewReleasedMovies();
            const upcomingmovie = await adminMovieRepo.upcomingReleasedMovies()
            console.log(newrelishedmovie);
            return res.render('webpages/home', {
                title: "Home Page - BookMyTicket", popularmovie, popularevent, newrelishedmovie, user: req.user
            })
        } catch (err) {
            console.log(err)
        }
    }

    // event page
    async events(req, res) {
        try {
            let movies;
            let { language, date, category, format } = req.query;
            const filterQuery = {
                isdelete: false,
            };

            // Normalize single-selects to arrays for consistency
            if (language && !Array.isArray(language)) language = [language];
            if (category && !Array.isArray(category)) category = [category];
            if (format && !Array.isArray(format)) format = [format];

            // Language filter (inside schedules array)
            if (language && language.length > 0) {
                filterQuery['schedules.language'] = { $in: language };
            }

            // Category filter (top-level)
            if (category && category.length > 0) {
                filterQuery.category = { $in: category };
            }

            // Format filter (inside schedules array)
            if (format && format.length > 0) {
                filterQuery['schedules.format'] = { $in: format };
            }

            // Date filter (inside schedules array)
            if (date) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let startDate, endDate;

                if (date === 'today') {
                    startDate = new Date(today);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                } else if (date === 'tomorrow') {
                    startDate = new Date(today);
                    startDate.setDate(startDate.getDate() + 1);
                    endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);
                } else if (date === 'weekend') {
                    const day = today.getDay();
                    const daysToSaturday = (6 - day + 7) % 7;
                    const daysToSunday = (7 - day + 7) % 7;

                    startDate = new Date(today);
                    startDate.setDate(today.getDate() + daysToSaturday);

                    endDate = new Date(today);
                    endDate.setDate(today.getDate() + daysToSunday);
                    endDate.setHours(23, 59, 59, 999);
                }

                if (startDate && endDate) {
                    filterQuery['schedules.date'] = {
                        $gte: startDate,
                        $lte: endDate,
                    };
                }
            }

            // Fetch data based on filters
            if ((language && language.length > 0) || date || (category && category.length > 0) || (format && format.length > 0)) {
                movies = await eventOrganizerRepositories.filteralldata(filterQuery);
            } else {
                movies = await eventOrganizerRepositories.shoallevents();
            }

            console.log(movies);

            return res.render('webpages/events', {
                title: "about Page - BookMyTicket", movies, user: req.user
            })
        } catch (err) {
            console.log(err)
        }
    }

    // single event
    async Detailse_Events(req, res) {
        try {
            const user = req.user;
            const id = req.params.id
            const moviedata = await eventOrganizerRepositories.findbyiddata(id);
            // console.log(moviedata)
             const userid = user ? user._id : '';

            const showtestmonialsata = await userRepositories.showtestimonialdata(id, userid)
            console.log(showtestmonialsata)
            const testimonialdata = await userRepositories.testimonial1dataforevent(id);
            // Safely reduce testimonial data
            let rev = [];
            if (testimonialdata && Array.isArray(testimonialdata)) {
                rev = testimonialdata.reduce((acc, cr) => {
                    const user = cr.data_test && cr.data_test[0];

                    acc.push({
                        username: user ? `${user.first_name} ${user.last_name}` : 'Anonymous',
                        userImg: user?.image || 'default.jpg',
                        userRole: "User",
                        rating: ((cr.rating) * 2) || 0,
                        text: cr.review || ''
                    });

                    return acc;
                }, []);
            }
            const mov = await eventOrganizerRepositories.shoalldata()
            // console.log(mov);

            let movies = [];
            if (mov && Array.isArray(mov)) {
                movies = mov.reduce((acc, ind) => {
                    const poster = ind.images[0]
                    acc.push({
                        title: ind.event_name,
                        img: poster,
                        id: ind._id
                    })
                    return acc;
                }, [])
            }
            // console.log(JSON.stringify(moviedata, null, 2))
            // console.log(moviedata)
            return res.render('webpages/events/single_event', {
                title: "Single Event Page - BookMyTicket", moviedata, reviews: rev, user, movies, userReview: showtestmonialsata && showtestmonialsata.length > 0 ? showtestmonialsata[0] : null,
            })
        } catch (err) {
            console.log(err)
        }
    }

    // event booking panal
    async event_booking_panal(req, res) {
        try {
            const id = req.params.id
            const movies = await eventOrganizerRepositories.single_movie_data(id);
            //    console.log(movies)
            const movie = await eventRepositories.single_movie_data(id);
            const uniqueMovies = movies[0].event_name

            console.log(uniqueMovies)
            const moviedata = movies.reduce((acc, da, ind,) => {
                const data = {};
                data.id = da._id
                data.company_name = da.company_id.company_name;
                data.company_id = da.company_id._id
                data.show_shedule = da.schedules;
                acc.push(data);
                return acc
            }, [])

            console.log(JSON.stringify(moviedata, null, 2))

            return res.render('webpages/events/event_shedule', {
                title: "contact Page - BookMyTicket", theaterData: moviedata, uniqueMovies, user: req.user
            })
        } catch (err) {
            console.log(err)
        }
    }

    // event seat matrix
    async event_seat_matrix_booking_panal(req, res) {
        try {

            const id = req.params.id
            const user = req.user
            console.log(user)
            let isLoggedIn;
            if (user) {
                isLoggedIn = true
            } else {
                isLoggedIn = false
            }
            const moviee = await eventOrganizerRepositories.schedules_data(id);
            const data = moviee.schedules[0]
            // console.log("moviee._id:", moviee?._id.toString());
            console.log(data);

            const event_data = await eventOrganizerRepositories.findallcompanybyid(moviee._id);
            console.log(event_data)
            const seatData = {
                prime: { price: data.prime_ticket_price, selected: 0, max: data.avl_prime_seats },
                classic: { price: data.clasic_ticket_price, selected: 0, max: data.avl_classic_seats },
                golden: { price: data.golden_ticket_price, selected: 0, max: data.avl_golden_seats },


            }
            const seatDa = {
                showDate: new Date(data.date).toISOString(),
                sheduleId: data._id,
                showTime: data.start_time,
                showTimeend: data.end_time,
                showname: event_data.event_name,
                image: event_data.images[0]
            }
            console.log(seatDa);

            return res.render('webpages/events/seat_matrix', {
                title: "contact Page - BookMyTicket", seatData, event_data, seatDa,
                isLoggedIn,
                userId: user?._id, apikey: process.env.APIKEY, user
            })
        } catch (err) {
            console.log(err)
        }
    }

    // contact us page
    async contact(req, res) {
        try {
            return res.render('webpages/contact', {
                title: "contact Page - BookMyTicket", user: req.user
            })
        } catch (err) {
            console.log(err)
        }
    }

    //    artist peofile
    async artist_profile(req, res) {
        try {
            const id = req.params.id
            const artistdata = await adminArtistRepo.sigleartist(id)
            console.log(JSON.stringify(artistdata, null, 2))
            return res.render('webpages/movie/artist_profile', {
                title: "contact Page - BookMyTicket", artistdata, user: req.user
            })
        } catch (err) {
            console.log(err)
        }
    }

    // show moviw trailler
    async show_traller(req, res) {
        try {
            const id = req.params.id
            const movie = await adminMovieRepo.findbyiddata(id);
            console.log(movie);
            
            const ldata = movie.trailers.reduce((acc, total, ind) => {
                acc.push({
                    lang: total.language,
                    id: total.language.toLowerCase(),
                    videoSrc: total.filename,
                    poster: total.filename,
                    movieUrl: total.filename
                })
                return acc;
            }, [])
            const movieData = {
                movieid: movie._id,
                moviename: movie.name,
                language_video: ldata
            }
            // console.log(JSON.stringify(moviedata, null, 2))
            return res.render('webpages/movie/show_traller', {
                title: "contact Page - BookMyTicket", movieData, user: req.user

            })
        } catch (err) {
            console.log(err)
        }
    }

    // all movie display
    async movies(req, res) {
        try {
            let movies;
            let { language, date, genre, format } = req.query;
            const filterQuery = { isdelete: false };

            // Normalize multi-select filters to arrays if they are single strings
            if (language && !Array.isArray(language)) language = [language];
            if (genre && !Array.isArray(genre)) genre = [genre];
            if (format && !Array.isArray(format)) format = [format];

            // Language filter using $in for multi-select
            if (language && language.length > 0) {
                filterQuery.languages = { $in: language };
            }

            // Genre filter using $in
            if (genre && genre.length > 0) {
                filterQuery.genre = { $in: genre };
            }

            // Format filter using $in
            if (format && format.length > 0) {
                filterQuery.format = { $in: format };
            }

            // Date filter based on releaseDate (single select)
            if (date) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                let startDate, endDate;

                if (date === 'today') {
                    startDate = new Date(today);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                } else if (date === 'tomorrow') {
                    startDate = new Date(today);
                    startDate.setDate(startDate.getDate() + 1);
                    endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);
                } else if (date === 'weekend') {
                    const day = today.getDay();
                    const daysToSaturday = (6 - day + 7) % 7;
                    const daysToSunday = (7 - day + 7) % 7;

                    startDate = new Date(today);
                    startDate.setDate(today.getDate() + daysToSaturday);

                    endDate = new Date(today);
                    endDate.setDate(today.getDate() + daysToSunday);
                    endDate.setHours(23, 59, 59, 999);
                }

                if (startDate && endDate) {
                    filterQuery.releaseDate = { $gte: startDate, $lte: endDate };
                }
            }

            // Fetch data based on filters
            if ((language && language.length > 0) || date || (genre && genre.length > 0) || (format && format.length > 0)) {
                movies = await adminMovieRepo.filteralldata(filterQuery);
            } else {
                movies = await adminMovieRepo.shoalldata();
            }

            console.log(movies);

            return res.render('webpages/movies', {
                title: "Movies Page - BookMyTicket",
                movies, user: req.user
            });

        } catch (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    }

    // single movie
    async Single_Events(req, res) {
        try {
            const user = req.user;
            const id = req.params.id;
            // Fetch movie data
            const moviedata = await adminMovieRepo.findbyiddata(id);
            // console.log(moviedata)
            if (!moviedata) {
                return res.status(404).send("Movie not found");
            }
            // Fetch testimonial data
            const testimonialdata = await userRepositories.testimonialdataforevent(id);
            const userid = user ? user._id : '';
            const showtestmonialsata = await userRepositories.showtestimonialdataformovie(id, userid)
            // console.log(testimonialdata);
            
            // Safely reduce testimonial data
            let rev = [];
            if (testimonialdata && Array.isArray(testimonialdata)) {
                rev = testimonialdata.reduce((acc, cr) => {
                    const user = cr.data_test && cr.data_test[0];

                    acc.push({
                        username: user ? `${user.first_name} ${user.last_name}` : 'Anonymous',
                        userImg: user?.image || 'default.jpg',
                        userRole: "User",
                        rating: ((cr.rating) * 2) || 0,
                        text: cr.review || ''
                    });

                    return acc;
                }, []);
            }
// console.log(rev);

            const mov = await adminMovieRepo.shoalldata()
            let movies = [];
            if (mov && Array.isArray(mov)) {
                movies = mov.reduce((acc, ind) => {
                    const poster = ind.posters[0]
                    acc.push({
                        title: ind.name,
                        img: poster,
                        id: ind._id
                    })
                    return acc;
                }, [])
            }
            // console.log(moviedata); 
            // console.log(JSON.stringify(moviedata, null, 2))
            return res.render('webpages/movie/solo_event', {
                title: "Single Event Page - BookMyTicket",
                moviedata,
                user,
                reviews: rev,
                movies,
                userReview: showtestmonialsata && showtestmonialsata.length > 0 ? showtestmonialsata[0] : null,
                user: req.user
            });

        } catch (err) {
            console.log(err)
        }
    }

    // movie booking panal
    async booking_panal(req, res) {
        try {
            const id = req.params.id
            const movie = await eventRepositories.single_movie_data(id);
            console.log(movie)
            const uniqueMovies = [
                ...new Map(
                    movie.map(item => [item.movie_id._id, { movie_id: item.movie_id._id, moviename: item.movie_id.name }])
                ).values()
            ];

            // console.log(uniqueMovies)
            const moviedata = movie.reduce((acc, da, ind,) => {
                const data = {};
                data.id = da._id
                data.company_name = da.company_id.company_name;
                data.company_id = da.company_id._id
                data.show_shedule = da.schedules;
                acc.push(data);
                return acc
            }, [])

            console.log(JSON.stringify(moviedata, null, 2))

            return res.render('webpages/movie/booking_panal', {
                title: "contact Page - BookMyTicket", theaterData: moviedata, uniqueMovies, user: req.user
            })
        } catch (err) {
            console.log(err)
        }
    }

    // movie seat matrix
    async seat_layout(req, res) {
        try {
            const user = req.user
            const isLoggedIn = user ? 'true' : 'false'; // becomes JS boolean after rendering


            // console.log(user)
            const id = req.params.id
            const moviee = await eventRepositories.schedules_data(id);
            console.log(moviee);

            const movie = moviee.schedules[0];
            // console.log(moviee);

            const movname = await eventRepositories.findbyiddata(moviee._id);
            // console.log(movname);
            const moviename = await adminMovieRepo.findbyiddata(movname.movie_id)
            // console.log(moviename);

            const comapnyid = await organizerRepositories.findallcompanybyid(movname.company_id)
            const mdata = {
                company_name: comapnyid.company_name,
                address: comapnyid.address
            }
            //  console.log(mdata);

            const schedule = {
                id: movie._id,
                title: moviename.name,
                image: moviename.posters[0],
                date: new Date(movie.date).toISOString(),
                start_time: movie.start_time,
                end_time: movie.end_time,
                screen: movie.screen,
                language: movie.language,
                prime_ticket_price: movie.prime_ticket_price,
                golden_ticket_price: movie.golden_ticket_price,
                classic_ticket_price: movie.clasic_ticket_price,
                prime_seats: movie.prime_seats,
                golden_seats: movie.golden_seats,
                classic_seats: movie.clasic_seats,
                prime_seats_sold: movie.prime_seats_book,
                golden_seats_sold: movie.golden_seats_book,
                classic_seats_sold: movie.classic_seats_book,
                enentid: moviee._id,


            }
            console.log(schedule)
            // console.log(JSON.stringify(moviedata, null, 2))

            return res.render('webpages/movie/seat_metrix', {
                title: "contact Page - BookMyTicket", schedule, user, apikey: process.env.APIKEY, mdata, isLoggedIn
            })
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = new WebController()