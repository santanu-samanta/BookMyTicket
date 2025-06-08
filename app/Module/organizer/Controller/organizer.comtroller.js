const { Validator } = require('node-input-validator');
const bycript = require('bcryptjs')
const jwt = require('jsonwebtoken')
const transporter = require('../../../Config/emailConfig');
const path = require('path')
const fs = require('fs');
const { title } = require('process');
const organizerRepositories = require('../Repositories/organizer.repositories');
const { errorCode } = require('../../../Helper/response');
const { hashpassword } = require('../../../Helper/auth');
const { companyUpdateSchema } = require('../../../Helper/joivalidation');
const Ticket = require('../../Tickets/Model/ticket.model');
const testimonial = require('../../user/Model/user.testimonial');
const ticketRepositories = require('../../Tickets/repositories/ticket.repositories');
const userRepositories = require('../../user/Repositories/user.repositories');
const eventRepositories = require('../Repositories/event.repositories');
const eventOrganizerRepositories = require('../Repositories/event.organizer.repositories');
class organizerController {


    // register page
    async registerpage_display(req, res) {
        try {

            return res.render('organizer/auth/register', {
                title: 'Organizer Register - BookMyTicket', user: req.organizer
            })
        } catch (err) {
            console.log(err)
        }
    }
   


    // organizer register
    async registerdata(req, res) {
        // console.log(req.body)
        try {
            // Initialize Validator with the input validation rules
            const v = new Validator(req.body, {
                company_name: 'required|string|minLength:2',
                phone: 'required|integer|minLength:10|maxLength:10',
                email: 'required|email',
                city: 'required|string',
                state: 'required|string',
                pin: 'required|integer',
                landmark: 'required|string',
            });
            // Validate inputs
            const matched = await v.check();

            if (!matched) {
                req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect('/organizer/register')
            }
            const { company_name, phone, email, city, state, pin, landmark,company_type } = req.body
            const passwo = await hashpassword(phone)
            const data = {
                company_name: company_name, phone: phone, email: email, password: passwo,company_type:company_type, role: 'Corporate',address: {
                    city: city, state: state, pin: pin, landmark: landmark, 
                }
            };

            const companyexist = await organizerRepositories.find(email)
            if (companyexist) {
                if (companyexist.isdelete == true) {
                    const id = companyexist._id

                    const updatedata = await organizerRepositories.updatebyid(id, data);
                    if (updatedata) {
                        return res.status(errorCode.success).json({ message: 'Company Data Resived Sucessfully' });
                    }
                }
                return res.status(errorCode.notFound).json({ message: 'Company Already Exist' });
            }
            const addcompany = await organizerRepositories.register(data)
            if (addcompany) {
                return res.status(errorCode.success).json({ success: true, message: 'Company Data Resived Sucessfully', user: addcompany });
            }
        } catch (error) {
            console.log(error)
            return res.status(errorCode.serverError).json({ message: error.message, error });
        }
    }


    // organizer log page display
    async login_page_display(req, res) {
        try {

            return res.render('organizer/auth/login_page', {
                title: 'Login Page - BookMyTicket', user: req.organizer
            })
        } catch (err) {
            console.log(err)
        }
    }


    // organizer login
    async login(req, res) {
        try {

            const v = new Validator(req.body, {
                email: "required|email",
                password: "required|minLength:6",
            });
            const matched = await v.check();
            if (!matched) {
                // If validation fails, send errors to the client
                req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect('/organizer/login')
            }
            const { email, password } = req.body

            const userexist = await organizerRepositories.find(email)

            if (!userexist) {
                // If validation fails, send errors to the client
                req.flash('error', `Invalid email`)
                return res.redirect('/organizer/login')
            }
            if (userexist.status !== 'Approved') {
                req.flash('error', `Email Not Found`)
                return res.redirect('/organizer/login')
            }

            if (userexist.isadmindelete) {
                req.flash('error', `Your account has been restricted because ${userexist.admindelete_msg}`);
                return res.redirect('/organizer/login')

            }
            if (userexist.isdelete) {
                req.flash('error', `Email Not Found`);
                return res.redirect('/organizer/login')
            }
            const passwordchack = await bycript.compare(password, userexist.password)
            if (!passwordchack) {
                req.flash('error', `Invalid password`)
                return res.redirect('/organizer/login')
            }
            if (userexist.role == 'Corporate') {
                const token = jwt.sign({
                    _id: userexist._id,
                    company_name: userexist.company_name,
                    phone: userexist.phone,
                    company_type: userexist.company_type,
                    email: userexist.email,
                    address: userexist.address,
                    role: userexist.role,
                    company_type: userexist.company_type,
                    logo: userexist.logo
                }, process.env.JWTSECRECT || 'WEBSKITTERFINALPROJECT', { expiresIn: '1h' })
                const refreshtoken = jwt.sign({
                    _id: userexist._id,
                    company_name: userexist.company_name,
                    phone: userexist.phone,
                    company_type: userexist.company_type,
                    email: userexist.email,
                    address: userexist.address,
                    role: userexist.role,
                    company_type: userexist.company_type,
                    logo: userexist.logo
                }, 'SKITTERFINALPROJECT', { expiresIn: '2h' })

                res.cookie('organizertoken', token)
                res.cookie('organizerreftoken', refreshtoken)
                if (!userexist.isverify) {
                    req.flash('error', `Please Change Your Password First`)
                    return res.redirect(`/organizer/change-password`)
                }
                req.flash('success', 'Login successful');
                return res.redirect('/organizer/dashboard')
            }
            req.flash('error', `Only Corporate Can Login`)
            return res.redirect('/organizer/login')


        } catch (error) {
            console.log(error)

        }
    }


    // organizer change-password display
    async organizer_change_password_display(req, res) {
        try {

            return res.render('organizer/auth/change_password', {
                title: 'Change Password - BookMyTicket', user: req.organizer
            })
        } catch (err) {
            console.log(err)
        }
    }


    // organizer change-password data store
    async organizer_change_password_data_store(req, res) {
        try {
            const organizer = req.organizer
            const id = organizer._id;
            const v = new Validator(req.body, {
                currentPassword: "required",
                newPassword: "required|minLength:6",
                confirmPassword: "required|minLength:6|same:newPassword",

            });
            const matched = await v.check();
            if (!matched) {
                // If validation fails, send errors to the client
                req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect(`/organizer/change-password`)
            }
            const { currentPassword, newPassword, confirmPassword } = req.body
            const userexist = await organizerRepositories.find(organizer.email)
            const passwordchack = await bycript.compare(currentPassword, userexist.password)
            if (!passwordchack) {
                req.flash('error', `Invalid Current password`)
                return res.redirect('/organizer/change-password')
            }
            const passwordchack2 = await bycript.compare(newPassword, userexist.password)
            if (passwordchack2) {
                req.flash('error', `Current password and New Password Can't be same`)
                return res.redirect('/organizer/change-password')
            }
            const haspass = await hashpassword(newPassword);
            const updatepass = await organizerRepositories.companypasswordchang(id, haspass);
            if (updatepass) {
                req.flash('success', 'Password Change Successfully');
                return res.redirect('/organizer/dashboard')
            }

        } catch (err) {
            console.log(err)
        }
    }


    // company profile
    async organizer_profile(req, res) {
        try {
            const user = req.organizer
            const id = user._id
            const company = await organizerRepositories.findallcompanybyid(id)
            return res.render('organizer/auth/opranizer_profile', {
                title: 'Organizer Profile - BookMyTicket', company, user
            })

        } catch (err) {
            console.log(err)
        }
    }


    // company profile update
    async organizer_profile_update(req, res) {
        try {

            const user = req.organizer
            const id = user._id
            const company = await organizerRepositories.findallcompanybyid(id)
            return res.render('organizer/auth/update_profile', {
                title: 'Update  Profile - BookMyTicket', company, user
            })

        } catch (err) {
            console.log(err)
        }
    }


    // company profile update data store
    async organizer_profile_update_data(req, res) {
        try {
            const user = req.organizer
            const id = user._id
            // Validate with Joi
            const { error, value } = companyUpdateSchema.validate(req.body, { abortEarly: false });

            if (error) {
                const errorMessages = error.details.map((err) => err.message);
                req.flash('error', errorMessages.join(', '));
                return res.redirect('/organizer/profile-update');
            }
            const cdata = await organizerRepositories.findallcompanybyid(id)

            const filePath = cdata.logo ? path.join(__dirname, '..', '..', '..', '..', cdata.logo) : null;
            console.log(filePath)
            const { company_name, phone, email,  address_city, address_state, address_pin, address_landmark, facilities, facilities_avl, screens } = req.body;
            if (req.file) {
                const updatedData = {
                    company_name, phone, email,  facilities_avl,
                    logo: req.file?.path || '',
                    address: {
                        city: address_city,
                        state: address_state,
                        pin: address_pin,
                        landmark: address_landmark
                    }
                };
                const data = await organizerRepositories.finbyidandupdatedata(id, updatedData)
                if (data) {
                    if (fs.existsSync(filePath)) {
                        try {
                            fs.unlinkSync(filePath);
                            console.log('File deleted successfully.');
                        } catch (err) {
                            console.error(' Error deleting file:', err.message);
                        }
                    } else {
                        console.log(' File does not exist.');
                    }
                    req.flash('success', 'Profile Update Succcessfully');
                    return res.redirect('/organizer/profile');
                }
            } else {
                const updatedData = {
                    company_name, phone, email,  facilities_avl,
                    address: {
                        city: address_city,
                        state: address_state,
                        pin: address_pin,
                        landmark: address_landmark
                    }
                };
                const data = await organizerRepositories.finbyidandupdatedata(id, updatedData)
                if (data) {
                    req.flash('success', 'Profile Update Succcessfully');
                    return res.redirect('/organizer/profile');
                }
            }


        } catch (err) {
            console.log(err)
        }
    }


    // organizer dashboard display
    async organizer_dashboard_display(req, res) {
        try {
            const user = req.organizer;
            let topEvents;
            let upcomingEvents;
            let engagementChart;
            let ticketsChart;
            let tota;
            let EventsCount;

            let data = await userRepositories.getTopmovieEvents()
            const { topMovie, topOrganizations } = data
            if (user.company_type == 'Production House' || user.company_type == 'Theatre Company') {

                let data1 = await ticketRepositories.getTicketStatsformovie(user._id)
                let { ticketChart, priceChart, totals } = data1
                const datas = await eventRepositories.upcomingMovieEvents(user._id)
                let { movieUpcomingEvents, totalEventsCountMovies } = datas
                tota = totals
                ticketsChart = ticketChart
                engagementChart = priceChart
                topEvents = topMovie
                upcomingEvents = movieUpcomingEvents
                EventsCount = totalEventsCountMovies
                // console.log("hello",datas)
            } else {
                let data12 = await ticketRepositories.getTicketStatsforevent(user._id)
                let dataso = await eventOrganizerRepositories.getupcamingevents(user._id)
                // console.log(data12);

                let { ticketChart, priceChart, totals } = data12
                let { orgUpcomingEvents, totalEventsCountOrg } = dataso
                tota = totals
                ticketsChart = ticketChart
                engagementChart = priceChart
                topEvents = topOrganizations
                upcomingEvents = orgUpcomingEvents
                EventsCount = totalEventsCountOrg
            } 

            // console.log(ticketsChart);

            // console.log(tota)
            // console.log(tota.totalTicketsSold)
            const company = req.organizer;
            const email = company.email;
            const companyexist = await organizerRepositories.find(email)
            const lastUpdated = new Date().toLocaleString();
            if (!companyexist.isverify) {
                req.flash('error', `Please Change Your Password First`)
                return res.redirect(`/organizer/change-password`)
            }

            //  console.log(data);
            //  console.log(data1);
            //  console.log(tota);


            return res.render('organizer/auth/dashboard', {
                user,
                title: 'Corporate dashboard - BookMyTicket', stats: [
                    { title: 'Events Created', value: EventsCount, icon: 'calendar-alt', color: 'primary' },
                    { title: 'Tickets Sold', value: tota.totalTicketsSold, icon: 'ticket-alt', color: 'info' },
                    { title: 'Revenue (₹)', value: tota.totalRevenue, icon: 'rupee-sign', color: 'success' },
                    { title: 'Active Users', value: tota.totalActiveUsers, icon: 'users', color: 'warning' },
                ],
                lastUpdated: Date.now(),
                topEvents,
                upcomingEvents,
                engagementChart,
                ticketsChart,
            })
        } catch (err) {
            console.log(err)
        }
    }

    
    //  logout
    async logout(req, res) {
        try {
            const user = req.organizer;
            res.clearCookie('organizertoken')
            req.flash('success', 'Logout Successfuly');
            return res.redirect('/organizer/login');
        } catch (error) {
            console.log(error)
            return res.status(errorCode.serverError).json({ message: error.message, error });
        }
    }


 // forgotpassword email
    async forgot_password(req, res) {
        try {

            return res.render('organizer/auth/forgotpassword', {
                title: 'Organizer Register - BookMyTicket', user: req.user
            })
        } catch (err) {
            console.log(err)
        }
    }


    // forgot password email send
    async forgotpassemailsend(req, res) {
        try {
            const v = new Validator(req.body, {
                email: "required|email",
            });
            const matched = await v.check();
            if (!matched) {
                // If validation fails, send errors to the client
                req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect('/organizer/forgot/password')

            }
            const { email } = req.body
            const usereesistchack = await organizerRepositories.existuser(email)

            if (!usereesistchack) {
                req.flash('error', 'Wrong Email')
                return res.redirect('/organizer/forgot/password')

            }
            const token = jwt.sign({
                _id: usereesistchack._id,
                first_name: usereesistchack.first_name,
                last_name: usereesistchack.last_name,
                phone: usereesistchack.phone,
                email: usereesistchack.email,
                date_of_birth: usereesistchack.date_of_birth,
                role: usereesistchack.role
            }, process.env.JWTSECRECT || 'WEBSKITTERFINALPROJECT', { expiresIn: '15m' })

            const link = `${process.env.BACKEND_URL}/organizer/forgot/password/page/${token}`
            const emailinfo = await transporter.sendMail({
                from: `${process.env.EMAIL_FROM}`, // sender address
                to: email, // list of receivers
                subject: "Reset Your Password - Action Required", // Subject line
                html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <title>Reset Your Password</title>
                            <style>
                            body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background-color: #f6f9fc;
                                margin: 0;
                                padding: 0;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 40px auto;
                                background-color: #ffffff;
                                border-radius: 10px;
                                padding: 40px;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                            }
                            h2 {
                                color: #2c3e50;
                            }
                            p {
                                line-height: 1.6;
                            }
                            .button {
                                display: inline-block;
                                padding: 12px 25px;
                                background-color: #4CAF50;
                                color: #ffffff;
                                border-radius: 5px;
                                text-decoration: none;
                                font-weight: bold;
                                margin-top: 20px;
                            }
                            .footer {
                                text-align: center;
                                font-size: 12px;
                                color: #888;
                                margin-top: 40px;
                            }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                            <h2>Password Reset Request</h2>
                            <p>Hello <strong>${usereesistchack.company_name }</strong>,</p>
                            <p>We received a request to reset your password. Click the button below to set a new password for your account.</p>
                            <a href="${link}" class="button">Reset Password</a>
                            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                            <p>Note: This password reset link will expire in 15 minutes for your security.</p>
                            <div class="footer">
                                &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
                            </div>
                            </div>
                        </body>
                        </html>`, // html body
            })
            if (emailinfo) {
                req.flash('success', 'Email send successfuly')
                return res.redirect('/organizer/login')
            }
            req.flash('error', 'Email Not Send Error!!')
            return res.redirect('/organizer/forgot/password')

        } catch (error) {
            console.log(error)
            return res.status(errorCode.serverError).json({ message: error.message, error });
        }
    }

    
 // register page
    async forgot_password_dataenter(req, res) {
        try {
             const token = req.params.token
            return res.render('organizer/auth/forgotpassword_passwordenter', {
                title: 'Organizer Register - BookMyTicket', user: req.user,token
            })
        } catch (err) {
            console.log(err)
        }
    }


    // forgot password update
    async forgotpassword(req, res) {
        try {
            const user = req.user;
            const token = req.params.token
            if (!user) {
                return res.status(errorCode.serverError).json({ message: "Not Authenticate usere" });
            }
            const v = new Validator(req.body, {
                password: 'required|minLength:6',
                confirm_password: 'required|minLength:6|same:password'
            });
            // Validate inputs
            const matched = await v.check();

            if (!matched) {
                // If validation fails, send errors to the client
                req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect(`/organizer/forgot/password/page/${token}`)
            }

            const { password, confirm_password } = req.body
            const hashedpassword = await hashpassword(password)
            const email = user.email

            const updata = await organizerRepositories.updatedata(email, hashedpassword)

            if (updata) {
                req.flash('success', 'Password updated successfully.')
                return res.redirect(`/organizer/login`)


            }
            req.flash('error', 'Error Occourd Try After Some Time')
            return res.redirect(`/organizer/login`)
        } catch (error) {
            console.log(error)

        }
    }


// account delete
    async accountdelete(req, res) {
        try {
            const user = req.organizer
            return res.render('organizer/auth/delete_account', { title: 'delete account', user })
        } catch (error) {
            console.log(error)
            return res.status(errorCode.serverError).json({ message: error.message, error });
        }
    }


    // accoutnt delete
    async deleteaccount(req, res) {
        try {
            const user = req.organizer;
            console.log(req.body);

            if (!user) {
                req.flash('error', 'User NotFound');
                return res.redirect('/organizer/delete-account');
            }
            const v = new Validator(req.body, {
                email: 'required|email'
            })
            const matched = await v.check();

            if (!matched) {
                req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect('/organizer/delete-account');
            }
            const { email } = req.body
            const usereemail = await organizerRepositories.existuser(email)
            console.log(usereemail);

            if (email !== usereemail.email) {
                req.flash('error', 'User already exists');
                return res.redirect('/organizer/delete-account');;
            }
            const useredata = await organizerRepositories.existuser(email)
            if (!useredata) {
                req.flash('error', 'Invalid email');
                return res.redirect('/organizer/delete-account');

            }
            if (useredata.isdelete) {
                req.flash('error', 'Your account already delete');
                return res.redirect('/organizer/delete-account');
            }
            const deletedata = await organizerRepositories.deleteaccount(email)
            if (deletedata) {
                req.flash('error', 'Account Delete successfully');
                return res.redirect('/organizer/logout');

            }
            req.flash('error', 'Account Not Delete Error Oucurred');
            return res.redirect('/organizer/delete-account');
        } catch (error) {
            console.log(error)
            return res.status(errorCode.serverError).json({ message: error.message, error });
        }
    }


}
module.exports = new organizerController();