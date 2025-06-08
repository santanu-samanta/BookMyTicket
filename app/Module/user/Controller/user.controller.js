const { Validator } = require('node-input-validator');
const { errorCode } = require('../../../Helper/response');
const { hashpassword } = require('../../../Helper/auth');
const bycript = require('bcryptjs')
const jwt = require('jsonwebtoken')
const transporter = require('../../../Config/emailConfig');
const { exist } = require('joi');
const userRepositories = require('../Repositories/user.repositories');
const verify = require('../../../Helper/verifyemailsend');
const adminMovieRepo = require('../../admin/Repositories/admin.movie.repo');
const eventOrganizerRepositories = require('../../organizer/Repositories/event.organizer.repositories');
const eventRepositories = require('../../organizer/Repositories/event.repositories');
const ticketRepositories = require('../../Tickets/repositories/ticket.repositories');
class usereController {

    // user profile
    async userprofile(req, res) {
        try {
            console.log(req.user)
            const user = req.user

            return res.render('user_pages/auth/userprofile', { title: 'Profile Page-BookMyTicket', user })
        } catch (err) {
            console.log(err)
        }
    }

    // update password page display
    async updatepassword(req, res) {
        try {
            console.log(req.user)
            const user = req.user

            return res.render('user_pages/auth/changpassword', { title: 'Profile Page-BookMyTicket', user })
        } catch (err) {
            console.log(err)
        }
    }

    // forhotpassword email send page display
    async forgotpassemailpage(req, res) {
        try {
            console.log(req.user)
            const user = req.user

            return res.render('user_pages/auth/forgotpassword', { title: 'Forgot Password Page-BookMyTicket', user })
        } catch (err) {
            console.log(err)
        }
    }

    // forgot password enter place page
    async forgotpasswordenter(req, res) {
        try {
            console.log(req.user)
            const user = req.user
            const token = req.params.token
            console.log(token);
            return res.render('user_pages/auth/nextforgotpassword', { title: 'Forgot Password Page-BookMyTicket', user, token })
        } catch (err) {
            console.log(err)
        }
    }

    // account delete page display
    async account_del(req, res) {
        try {
            console.log(req.user)
            const user = req.user

            return res.render('user_pages/auth/deleteaccount', { title: 'Account Delete Page-BookMyTicket', user })
        } catch (err) {
            console.log(err)
        }
    }

    // login page display
    async loginpage_display(req, res) {
        try {
            return res.render('user_pages/auth/loginpages', { title: 'Login Page-BookMyTicket', user: req.user })
        } catch (err) {
            console.log(err)
        }
    }

    // user dashboard display
    async dashboard_display(req, res) {
        try {
            const user = req.user;
            const data = await ticketRepositories.getTicketStatsforuserdashboard(user._id);
            const { stats, upcomingevents, pastevents, todaysEvents } = data;


            const formattedUpcomingEvents = upcomingevents.map(event => {
                const date = new Date(event.moviedate);
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const year = date.getUTCFullYear();
                return {
                    ...event,
                    formattedDate: `${day}-${month}-${year}` // this will be used in EJS
                };
            });
            const formattedpastEvents = pastevents.map(event => {
                const date = new Date(event.moviedate);
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const year = date.getUTCFullYear();
                return {
                    ...event,
                    formattedDate: `${day}-${month}-${year}` // this will be used in EJS
                };
            });
            console.log(upcomingevents)
            return res.render('user_pages/auth/dashboard', {
                title: 'My Dashboard',
                user,
                stats,
                upcomingevents: formattedUpcomingEvents, // use formatted data here
                pastevents: formattedpastEvents,
                todaysEvents
            });
        } catch (err) {
            console.log(err);
        }
    }

    // user event page display in user dashboard
    async events(req, res) {
        try {
            const user = req.user;
            const data = await ticketRepositories.getTicketStatsforuserdashboard(user._id);
            const { stats, upcomingevents, pastevents, todaysEvents } = data;


            const formattedUpcomingEvents = upcomingevents.map(event => {
                const date = new Date(event.moviedate);
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const year = date.getUTCFullYear();
                return {
                    ...event,
                    formattedDate: `${day}-${month}-${year}` // this will be used in EJS
                };
            });
            const formattedpastEvents = pastevents.map(event => {
                const date = new Date(event.moviedate);
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const year = date.getUTCFullYear();
                return {
                    ...event,
                    formattedDate: `${day}-${month}-${year}` // this will be used in EJS
                };
            });
            console.log(upcomingevents)
            return res.render('user_pages/auth/events', {
                title: 'My Events',
                user,
                stats,
                upcomingevents: formattedUpcomingEvents, // use formatted data here
                pastevents: formattedpastEvents,
                todaysEvents
            });
        } catch (err) {
            console.log(err);
        }
    }

    // user register page display
    async register_display(req, res) {
        try {
            return res.render('user_pages/auth/registerpage', {
                title: "Register Page - BookMyTicket", user: req.user
            })
        } catch (err) {
            console.log(err)
        }
    }

    // user register data store
    async register(req, res) {
        try {
            const v = new Validator(req.body, {
                first_name: 'required|string|minLength:3|maxLength:30',
                last_name: 'required|string|minLength:3|maxLength:30',
                email: 'required|email',
                date_of_birth: 'required|date',
                phone: 'required|integer|minLength:10|maxLength:10',
                gender: 'required|string|in:Male,Female,Other',
                password: 'required|minLength:6',
            });

            const matched = await v.check();

            if (!matched) {
                req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect('/user/registerpage-display')
            }

            const { first_name, last_name, email, phone, date_of_birth, gender, password } = req.body;
            const userExists = await userRepositories.existuser(email);
            const hashedPassword = await hashpassword(password);

            if (userExists) {
                if (userExists.isdelete == true) {
                    const id = userExists._id;
                    const data = { first_name, last_name, email, phone, date_of_birth, gender, password, password: hashedPassword };
                    const addedUser = await userRepositories.findbyid(data, id);
                    if (addedUser) {
                        if (sendemail) {
                            req.flash('success', 'User registered successfully and sent verification email');
                            return res.redirect('/user/loginpage-display');
                        }

                        req.flash('error', 'User registered successfully but verification email not sent');
                        return res.redirect('/user/loginpage-display');
                    }
                }
                req.flash('error', 'User already exists');
                return res.redirect('/user/registerpage-display');
            }

            const data = { first_name, last_name, email, phone, date_of_birth, gender, password, password: hashedPassword };
            const addedUser = await userRepositories.adddata(data);
            if (addedUser) {
                const sendEmail = await verify(email)

                if (sendEmail) {
                    req.flash('success', 'User registered successfully and sent verification email');
                    return res.redirect('/user/loginpage-display');
                }
                req.flash('error', 'User registered successfully but verification email not sent');
                return res.redirect('/user/loginpage-display');
            }

            req.flash('error', 'Server error');
            return res.redirect('/user/registerpage-display');
        } catch (error) {
            console.log(error);
        }
    }

    // uaer emailverify 
    async emailverify(req, res) {
        try {
            const user = req.user;
            const usereesistchack = await userRepositories.existuser(user.email)
            if (!usereesistchack) {
                req.flash('error', 'User Not Exist In our System');
                return res.redirect('/user/loginpage-display')
            }
            if (usereesistchack.isverify) {
                req.flash('error', 'User Already Verified');
                return res.redirect('/user/loginpage-display')
            }
            const verifyemail = await userRepositories.verifyemail(user.email)
            if (verifyemail) {
                req.flash('success', 'Email Verify successfully Login!');
                return res.redirect('/user/loginpage-display');
            }
        } catch (error) {
            console.log(error)

        }
    }

    // user login
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
                return res.redirect('/user/loginpage-display')
            }
            const { email, password } = req.body

            const usereexist = await userRepositories.existuser(email)

            if (!usereexist) {
                // If validation fails, send errors to the client
                req.flash('error', `Invalid email`)
                return res.redirect('/user/loginpage-display')
            }
            if (usereexist.isadmindelete) {
                req.flash('error', `Your account has been restricted because ${usereexist.admindelete_msg}`);
                return res.redirect('/user/loginpage-display')

            }
            if (usereexist.isdelete) {
                req.flash('error', `Email Not Found`);
                return res.redirect('/user/loginpage-display')

            }
            if (!usereexist.isverify) {
                req.flash('error', `Verify Your Email`);
                return res.redirect('/user/loginpage-display')

            }
            const passwordchack = await bycript.compare(password, usereexist.password)
            if (!passwordchack) {
                req.flash('error', `Invalid password`);
                return res.redirect('/user/loginpage-display')

            }
            if (usereexist.role == 'user') {
                const token = jwt.sign({
                    _id: usereexist._id,
                    first_name: usereexist.first_name,
                    last_name: usereexist.last_name,
                    phone: usereexist.phone,
                    email: usereexist.email,
                    date_of_birth: usereexist.date_of_birth,
                    role: usereexist.role
                }, process.env.JWTSECRECT || 'WEBSKITTERFINALPROJECT', { expiresIn: '2h' })

                res.cookie('usertoken', token, { maxAge: 7200000, httpOnly: true })
                req.flash('success', 'Login successful');
                return res.redirect('/')
            }
            req.flash('error', `Only user Can Login`);
            return res.redirect('/user/loginpage-display')



        } catch (error) {
            console.log(error)

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
                return res.status(errorCode.forbidden).json({
                    message: Object.values(v.errors).map(err => err.message)
                });
            }
            const { email } = req.body
            const usereesistchack = await userRepositories.existuser(email)

            if (!usereesistchack) {
                return res.status(errorCode.forbidden).json({ message: "Wrong Email" });
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

            const link = `${process.env.BACKEND_URL}/user/forgot/password/${token}`
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
                            <p>Hello <strong>${usereesistchack.first_name + " " + usereesistchack.last_name}</strong>,</p>
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
                
                return res.status(errorCode.success).json({
                    message: "Email Send successfully."
                });
            }
            return res.status(errorCode.forbidden).json({ message: "Email Not Send Error!!", });
        } catch (error) {
            console.log(error)
            return res.status(errorCode.serverError).json({ message: error.message, error });
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
                return res.redirect(`/user/forgot/password/${token}`)
            }

            const { password, confirm_password } = req.body
            const hashedpassword = await hashpassword(password)
            const email = user.email

            const updata = await userRepositories.updatedata(email, hashedpassword)

            if (updata) {
                req.flash('success', 'Password updated successfully.')
                return res.redirect(`/user/loginpage-display`)


            }
            req.flash('error', 'Error Occourd Try After Some Time')
            return res.redirect(`/user/loginpage-display`)
        } catch (error) {
            console.log(error)

        }
    }
    // change password update
    async changepassword(req, res) {
        try {
            console.log(req.body)
            const user = req.user;
            if (!user) {
                req.flash('error', 'Not Authenticate usere');
                return res.redirect('/user/loginpage-display');
            }
            const v = new Validator(req.body, {
                newPassword: 'required|minLength:6',
                confirmPassword: 'required|minLength:6|same:newPassword'
            });
            // Validate inputs
            const matched = await v.check();

            if (!matched) {
                // If validation fails, send errors to the client
                req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect('/user/change-password')
            }
            const { newPassword, confirmPassword, currentPassword } = req.body
            const usereexist = await userRepositories.existuser(user.email)
            console.log(usereexist)
            const passwordchack = bycript.compare(usereexist.password, currentPassword)
            console.log(passwordchack);

            if (!passwordchack) {
                req.flash('error', `Invalid Current password`);
                return res.redirect('/user/change-password')

            }

            const hashedpassword = await hashpassword(newPassword)
            const email = user.email

            const updata = await userRepositories.updatedata(email, hashedpassword)

            if (updata) {
                req.flash('success', 'Password Chnage successfully');
                return res.redirect('/user/dashboard-display');

            }
            req.flash('error', 'Password Not Chnage Error Oucurred');
            return res.redirect('/user/change-password');

        } catch (error) {
            console.log(error)

        }
    }

    // user account delete
    async deleteaccount(req, res) {
        try {
            const user = req.user;
            console.log(req.body);

            if (!user) {
                req.flash('error', 'User NotFound');
                return res.redirect('/user/delete/account');
            }
            const v = new Validator(req.body, {
                email: 'required|email'
            })
            const matched = await v.check();

            if (!matched) {
               req.flash('error', Object.values(v.errors).map(err => err.message))
                return res.redirect('/user/delete/account');
            }
            const { email } = req.body
            const usereemail = await userRepositories.existuser(email)
            console.log(usereemail);

            if (email !== usereemail.email) {
                req.flash('error', 'User already exists');
                return res.redirect('/user/delete/account');
            }
            const useredata = await userRepositories.existuser(email)
            if (!useredata) {
                req.flash('error', 'Invalid email');
                return res.redirect('/user/delete/account');

            }
            if (useredata.isdelete) {
                req.flash('error', 'Your account already delete');
                return res.redirect('/user/delete/account');

            }
            const deletedata = await userRepositories.deleteaccount(email)
            if (deletedata) {
                req.flash('error', 'Account Delete successfully');
                return res.redirect('/user/logout');

            }
            req.flash('error', 'Account Not Delete Error Oucurred');
            return res.redirect('/user/delete/account');
        } catch (error) {
            console.log(error)
            return res.status(errorCode.serverError).json({ message: error.message, error });
        }
    }

    // user logout
    async logout(req, res) {
        try {
           console.log('hello')
            res.clearCookie('usertoken')
            req.flash('success', 'Logout Successfuly');
            return res.redirect('/user/loginpage-display');
        } catch (error) {
            console.log(error)
            return res.status(errorCode.serverError).json({ message: error.message, error });
        }
    }

    // tsetimonial create update
    async testimonial(req, res) {
        try {
            console.log(req.body)
            const id = req.params.id
            const user = req.user;
            // Initialize Validator with the input validation rules
            const v = new Validator(req.body, {
                review: 'required|string|minLength:3',
                rating: 'required|integer',
            });
            // Validate inputs
            const matched = await v.check();
            if (!matched) {
                // If validation fails, send errors to the client
                req.flash('error', Object.values(v.errors).map(err => err.message))
                // return res.redirect('/user/loginpage-display')
                return res.status(400).json({ message: v.errors });
            }
            if (!user) {
                return res.status(400).json({ message: "Not Authenticate user" });
            }
            const { review, rating, movie } = req.body;

            if (movie === 'true') {

                const evdata = await adminMovieRepo.siglemovie(id);
                console.log(evdata);

                // const movieid=await adminMovieRepo
                const data = { review, rating, movie, userid: user._id, movie_id: id, ismovie: true }
                if (!evdata) {
                    return res.status(400).json({ message: "This Movie Not Found" });

                }
                const datastore = await userRepositories.testimonialdtasaveformovie(data)
                if (datastore) {
                    return res.status(200).json({ message: "Testimonial data Save successfully" });
                }
            } else {

                const evdata = await eventOrganizerRepositories.findallcompanybyid(id);
                console.log(evdata)
                const data = { review, rating, movie, userid: user._id, eventorganization_id: id, ismovie: false }
                if (!evdata) {
                    return res.status(400).json({ message: "This Event Not Found" });
                }
                const datastore = await userRepositories.testimonialdtasave(data)
                if (datastore) {
                    return res.status(200).json({ message: "Testimonial data Save successfully" });

                }
            }

            return res.status(400).json({ message: "Server Error" });

        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: error.message, error });
        }
    }

    // tsetimonial delete
    async testimonialdelete(req, res) {
        try {
            const id = req.params.id
            const user = req.user;
            // Initialize Validator with the input validation rules
            if (!user) {
                req.flash('error', `Not Authenticate user`)
                return res.status(400).json({ message: "Not Authenticate user" });
            }
            const datastore = await userRepositories.testimonialdelete(id)
            if (datastore) {
                req.flash('success', `Testimonial delete successfully`)
                return res.status(200).json({ message: "Testimonial delete successfully" });
            }
            req.flash('error', `Server Error`)
            return res.status(400).json({ message: "Server Error" });

        } catch (error) {
            console.log(error)
            
        }
    }
}

module.exports = new usereController();