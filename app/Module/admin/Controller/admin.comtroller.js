const { Validator } = require('node-input-validator');
const bycript = require('bcryptjs');
const organizerRepositories = require('../../organizer/Repositories/organizer.repositories');
const userRepositories = require('../../user/Repositories/user.repositories');
const jwt = require('jsonwebtoken');
const eventRepositories = require('../../organizer/Repositories/event.repositories');
const moment = require('moment');
const transporter = require('../../../Config/emailConfig');
const eventmodel = require('../../organizer/Model/enent.model');
const organizereventmodel = require('../../organizer/Model/event.organizer');
const ticketRepositories = require('../../Tickets/repositories/ticket.repositories');
const Ticket = require('../../Tickets/Model/ticket.model');

class adminController {
    // admin login paage display
    async loginpage_display(req, res) {
        try {
            return res.render('admin_page/auth/admin_login_page', {
                title: 'Admin Login - BookMyTicket'
            })
        } catch (err) {
            console.log(err)
        }
    }
    async admin_logout(req, res) {
        try {
             
            res.clearCookie('admintoken')
            req.flash('success', 'Logout Successfuly');
            return res.redirect('/admin/login');

        } catch (err) {
            console.log(err)
        }
    }
    // admin login
    async login(req, res) {
        try {
            const v = new Validator(req.body, {
                email: "required|email",
                password: "required|minLength:6",
            });
            const matched = await v.check();
            if (!matched) {
                // If validation fails, send errors to the client
                req.flash('warning', Object.values(v.errors).map(err => err.message))
                return res.redirect('/admin/login')
            }
            const { email, password } = req.body

            const userexist = await userRepositories.existuser(email)
            if (!userexist) {
                // If validation fails, send errors to the client
                req.flash('warning', `Invalid email`)
                return res.redirect('/admin/login')
            }
            if (userexist.isdelete) {
                req.flash('warning', `Email Not Found`);
                return res.redirect('/admin/login')
            }
            const passwordchack = await bycript.compare(password, userexist.password)
            if (!passwordchack) {
                req.flash('warning', `Invalid password`)
                return res.redirect('/admin/login')
            }
            if (userexist.role == 'admin') {
                const token = jwt.sign({
                    _id: userexist._id,
                    first_name: userexist.first_name,
                    last_name: userexist.last_name,
                    email: userexist.email,
                    phone: userexist.phone,
                    gender: userexist.gender,
                    date_of_birth: userexist.date_of_birth,
                    role: userexist.role
                }, process.env.JWTSECRECT || 'WEBSKITTERFINALPROJECT', { expiresIn: '2h' })

                res.cookie('admintoken', token, { maxAge: 7200000, httpOnly: true })
                req.flash('success', 'Login successful');
                return res.redirect('/admin/dashboard')
            }
            req.flash('warning', `Only admin Can Login`)
            return res.redirect('/admin/login')


        } catch (error) {
            console.log(error)

        }
    }
    // admin login paage display
    async admin_dashbord_display(req, res) {
        try {


            // ariachart data
            function getMonthName(monthIndex) {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return monthNames[monthIndex];
            }

            const now = new Date();
            const startYear = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year

            // Fetch events and movies created this year
            const events = await organizereventmodel.find({ createdAt: { $gte: startYear } });
            const movies = await eventmodel.find({ createdAt: { $gte: startYear } });

            const labels = Array.from({ length: 12 }, (_, i) => getMonthName(i));
            const categoryMap = {};

            // Function to add count for category at given month index
            const addToCategory = (category, monthIndex) => {
                if (!categoryMap[category]) categoryMap[category] = new Array(12).fill(0);
                categoryMap[category][monthIndex]++;
            };

            // Aggregate event bookings by category and month
            events.forEach(event => {
                const monthIndex = event.createdAt.getMonth();
                const category = event.category || 'Other';
                addToCategory(category, monthIndex);
            });

            // Initialize Movie category array to zeros for all months
            categoryMap['Movie'] = new Array(12).fill(0);

            // Aggregate movie bookings by month
            movies.forEach(movie => {
                const monthIndex = movie.createdAt.getMonth();
                addToCategory('Movie', monthIndex);
            });



            // paichaart data

            const categoryStats = await organizereventmodel.aggregate([
                {
                    $match: {
                        isdelete: false,
                        category: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 } // Optional: sort by popularity
                }
            ]);

            const totalEventsCountMovies = await eventmodel.countDocuments({
                isdelete: false,
                isadmindelete: false
            });

            const labelsg = categoryStats.map(cat => cat._id || 'Uncategorized');
            const datapai = categoryStats.map(cat => cat.count);
            labelsg.push('Movie');
            datapai.push(totalEventsCountMovies)
            const pieLabels = [
                { value: 'music', name: 'Music & Concerts', color: 'primary' },
                { value: 'workshops', name: 'Workshops & Seminars', color: 'info' },
                { value: 'sports', name: 'Sports & Fitness', color: 'success' },
                { value: 'festivals', name: 'Festivals & Cultural', color: 'warning' },
                { value: 'corporate', name: 'Corporate & Networking', color: 'secondary' },
                { value: 'kids', name: 'Kids & Family', color: 'danger' },
                { value: 'nightlife', name: 'Nightlife & Parties', color: 'dark' },
                { value: 'exhibitions', name: 'Exhibitions & Expos', color: 'purple' },
                { value: 'charity', name: 'Charity & Fundraisers', color: 'teal' },
                { value: 'virtual', name: 'Virtual & Online', color: 'cyan' }
            ];

            // Bootstrap-like color hex codes (you can customize as needed)
            const bootstrapColors = {
                primary: '#4e73df',
                success: '#1cc88a',
                warning: '#f6c23e',
                info: '#36b9cc',
                secondary: '#858796',
                danger: '#e74a3b',
                dark: '#5a5c69',
                purple: '#6f42c1',
                teal: '#20c997',
                cyan: '#17a2b8'
            };

            const bootstrapHoverColors = {
                primary: '#2e59d9',
                success: '#17a673',
                warning: '#d4ac0d',
                info: '#2c9faf',
                secondary: '#6c757d',
                danger: '#be2617',
                dark: '#343a40',
                purple: '#563d7c',
                teal: '#138f80',
                cyan: '#117a8b'
            };

            const backgroundColor = categoryStats.map(cat => {
                const match = pieLabels.find(p => p.value === cat._id);
                return bootstrapColors[match?.color] || '#858796'; // default gray
            });

            const hoverBackgroundColor = categoryStats.map(cat => {
                const match = pieLabels.find(p => p.value === cat._id);
                return bootstrapHoverColors[match?.color] || '#6c757d'; // default hover gray
            });
            // Pie chart config with categories
            const pieChartConfig = {
                type: 'doughnut',
                data: {
                    labels: labelsg,
                    datasets: [{
                        data: datapai,
                        backgroundColor: backgroundColor,
                        hoverBackgroundColor: hoverBackgroundColor,
                        hoverBorderColor: "rgba(234, 236, 244, 1)"
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { display: false }
                    }
                }
            };



            let ticketsChart;
            let data12 = await ticketRepositories.getTicketStatsforeventadmin()

            let { ticketChart} = data12

            ticketsChart = ticketChart

            // Big Event Booking Trends chart config (your existing data)
            const largeAreaChartConfig = {
                type: 'line',
                data: {
                    labels: ticketsChart.labels ,
                    datasets: [{
                        label: 'Bookings',
                        data: ticketsChart.data ,
                        fill: true,
                        backgroundColor: 'rgba(78, 115, 223, 0.2)',
                        borderColor: 'rgba(78, 115, 223, 1)',
                        tension: 0.4,
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(234, 236, 244, 0.5)',
                                borderDash: [2],
                            }
                        },
                        x: {
                            grid: {
                                display: false,
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    interaction: { mode: 'nearest', intersect: false },
                }
            };
           

            let data1 = await ticketRepositories.getTicketStatsformovieadmin()
                            let movieticketsChart = data1.ticketChart
                            console.log(data1)
                            // movie and event both
            let pricechart = await ticketRepositories.getpriceforeventadmin()
                            let priceicketsChart = pricechart.priceChart
            let ticketchart=pricechart.ticketChart
            let totaldata=pricechart.totals

            // Bar chart for Monthly Ticket Sales
            const barChartConfig = {
                type: 'bar',
                data: {
                    labels: ticketchart.labels,
                    datasets: [{
                        label: 'Tickets Sold',
                        data: ticketchart.data,
                        backgroundColor: '#4e73df',
                        borderRadius: 5,
                        maxBarThickness: 25
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(234, 236, 244, 0.5)',
                                borderDash: [2],
                            }
                        },
                        x: {
                            grid: {
                                display: false,
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            };

          const totalCountMovies = await eventmodel.countDocuments({
                isdelete: false,
                isadmindelete: false
            });
             const totalCountevent = await organizereventmodel.countDocuments({
                isdelete: false,
                isadmindelete: false
            });
            
         
          

            // Summary cards data example
            const stats = [
                { title: 'Total Events', value:totalCountMovies + totalCountevent, icon: 'calendar-alt', color: 'primary' },
                { title: 'Total Bookings', value: totaldata.TicketsSoltotad, icon: 'ticket-alt', color: 'success' },
                { title: 'Total Revenue', value: totaldata.totalRevenue, icon: 'dollar-sign', color: 'info' },
                { title: 'Active Users', value: totaldata.totalActiveUsers, icon: 'users', color: 'warning' }
            ];







            return res.render('admin_page/auth/admin_dashbord', {
                title: 'Admin Dashboard - BookMyTicket',  user:req.admin,
                stats,
                largeAreaChartConfig,
                labels,
                categoryData: categoryMap,
                pieChartConfig,
                barChartConfig,

                pieLabels,
                signupLabels: movieticketsChart.labels,
                signupData: movieticketsChart.data,
                revenueLabels: priceicketsChart.labels,
                revenueData: priceicketsChart.data,
              
            })
        } catch (err) {
            console.log(err)
        }
    }
    // show company table 
    async company_table(req, res) {
        try {
            const companydata = await organizerRepositories.findallcompanydetailse()
            return res.render('admin_page/company/company_table', {
                title: 'Admin Dashboard - BookMyTicket', companydata, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }


    // theater movie taking detailse

    async booking_table(req, res) {
        try {
            const company = await eventRepositories.finbbookingdata()

            return res.render('admin_page/movie_taking/booking_histroy', {
                title: 'Admin Dashboard - BookMyTicket', company, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }
    async booking_detailse(req, res) {
        try {
            const id = req.params.id
            const company = await eventRepositories.finbbookingdatabyid(id)

            return res.render('admin_page/movie_taking/booking_detailse', {
                company: company[0], moment, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }
    async booking_approved(req, res) {
        try {
            const id = req.params.id
            const company = await eventRepositories.bookingapproved(id)
            const data = await eventRepositories.findbyiddataforemail(id)
            // console.log('hello',data)
            if (company) {
                const sendemail = await transporter.sendMail({
                    from: `BookMyTicket ${process.env.EMAIL_FROM}`,
                    to: data.company_id.email,
                    subject: `🎬 Good News! Your Booking  ${data.movie_id.name} Has Been Approved`,
                    html: `<!DOCTYPE html>
                            <html lang="en" style="margin: 0; padding: 0;">
                            <head>
                            <meta charset="UTF-8" />
                            <title>Booking Approved After Rejection</title>
                            <style>
                                body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 0;
                                color: #333;
                                }
                                .email-container {
                                max-width: 600px;
                                margin: 40px auto;
                                background-color: #fff;
                                border-radius: 8px;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                                padding: 30px;
                                }
                                .header {
                                background-color: #28a745;
                                color: white;
                                padding: 20px;
                                border-radius: 8px 8px 0 0;
                                text-align: center;
                                }
                                .content {
                                padding: 20px;
                                }
                                .highlight {
                                background-color: #d4edda;
                                border-left: 4px solid #28a745;
                                padding: 15px;
                                margin: 20px 0;
                                border-radius: 4px;
                                color: #155724;
                                }
                                .footer {
                                font-size: 14px;
                                margin-top: 30px;
                                border-top: 1px solid #ddd;
                                padding-top: 20px;
                                text-align: center;
                                }
                                .footer a {
                                color: #007bff;
                                text-decoration: none;
                                }
                                .movie-title {
                                font-size: 18px;
                                font-weight: 600;
                                color: #28a745;
                                }
                            </style>
                            </head>
                            <body>
                            <div class="email-container">
                                <div class="header">
                                <h2>Booking Approved</h2>
                                </div>

                                <div class="content">
                            <p>Dear <strong>${data.company_id.company_name}</strong>,</p>
                            <p>We're pleased to inform you that your booking for the movie <span>${data.movie_id.name}</span>, which was previously rejected, has now been <strong>approved</strong>.</p>

                            <div class="highlight">
                                <strong>Status Update:</strong><br/>
                                Your booking request has been re-evaluated and successfully approved by our administration team.
                            </div>

                            <p>Feel free to contact us if you have any questions or require further assistance.</p>

                           <p><strong>Support Email:</strong> <a href="mailto:support@bookmyticket.com">support@bookmyticket.com</a></p>

                            <p>Thank you for understanding.</p>
                            </div>
                            <div class="footer">${new Date().getFullYear()} BookMyTicket. All rights reserved.
                            </div>
                        </div>
                        </body>
                        </html>`
                })
                if (sendemail) {
                    req.flash('success', 'Booking Approved Sucessfully and Send Approved Email');
                    return res.redirect('/admin/booking-histroy')
                }
                req.flash('success', 'Booking Approved Sucessfully But  Approved Email Not Send Because Wrng Email Address');
                return res.redirect('/admin/booking-histroy')
            }
        } catch (err) {
            console.log(err)
        }
    }
    async booking_reject(req, res) {
        try {
            const id = req.params.id
            const { msg } = req.body
            const company = await eventRepositories.bookingreject(id, msg)
            const data = await eventRepositories.findbyiddataforemail(id)
            // console.log('hello',data)
            if (company) {
                const sendemail = await transporter.sendMail({
                    from: `BookMyTicket ${process.env.EMAIL_FROM}`,
                    to: data.company_id.email,
                    subject: `Booking Rejected: ${data.movie_id.name}`,
                    html: `<!DOCTYPE html>
                        <html>
                        <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        <title>Booking Rejection</title>
                        <style>
                            body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f8f9fc;
                            margin: 0;
                            padding: 0;
                            }
                            .email-container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                            }
                            .header {
                            background-color: #dc3545;
                            color: white;
                            text-align: center;
                            padding: 20px;
                            }
                            .header h1 {
                            margin: 0;
                            font-size: 24px;
                            }
                            .content {
                            padding: 30px;
                            }
                            .content p {
                            font-size: 16px;
                            color: #4a4a4a;
                            line-height: 1.6;
                            }
                            .details-box {
                            background-color: #f1f1f1;
                            padding: 15px;
                            margin: 20px 0;
                            border-left: 4px solid #dc3545;
                            }
                            .footer {
                            text-align: center;
                            padding: 20px;
                            font-size: 14px;
                            color: #888;
                            background-color: #f1f1f1;
                            }
                            .btn {
                            display: inline-block;
                            padding: 10px 20px;
                            margin-top: 20px;
                            background-color: #4e73df;
                            color: white;
                            text-decoration: none;
                            border-radius: 4px;
                            }
                            @media (max-width: 600px) {
                            .content, .header, .footer {
                                padding: 15px;
                            }
                            }
                        </style>
                        </head>
                        <body>
                        <div class="email-container">
                            <div class="header">
                            <h1>Booking Rejected</h1>
                            </div>
                            <div class="content">
                            <p>Dear <strong>${data.company_id.company_name}</strong>,</p>
                            <p>We regret to inform you that your movie booking request for <strong>${data.movie_id.name}</strong> has been <span style="color: #dc3545; font-weight: bold;">rejected</span>.</p>

                            <div class="details-box">
                                <p><strong>Rejection Message:</strong></p>
                                <p>${data.admindelete_msg}</p>
                            </div>

                            <p>If you believe this was a mistake or have any questions, feel free to reach out to us for further clarification.</p>

                           <p><strong>Support Email:</strong> <a href="mailto:support@bookmyticket.com">support@bookmyticket.com</a></p>

                            <p>Thank you for understanding.</p>
                            </div>
                            <div class="footer">${new Date().getFullYear()} BookMyTicket. All rights reserved.
                            </div>
                        </div>
                        </body>
                        </html>`
                })
                if (sendemail) {
                    req.flash('success', 'Booking Reject Sucessfully and Send Rejction Email');
                    return res.redirect('/admin/booking-histroy')
                }
                req.flash('success', 'Booking Reject Sucessfully But  Rejction Email Not Send Because Wrng Email Address');
                return res.redirect('/admin/booking-histroy')
            }
        } catch (err) {
            console.log(err)
        }
    }




}
module.exports = new adminController();