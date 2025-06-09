const { Validator } = require('node-input-validator');
const bycript = require('bcryptjs');
const organizerRepositories = require('../../organizer/Repositories/organizer.repositories');
const transporter = require('../../../Config/emailConfig');
const { Query } = require('mongoose');
const { hashpassword } = require('../../../Helper/auth');

class adminCompanyController {


    // show company table 
    async company_table(req, res) {
        try {
            const companydata = await organizerRepositories.findallcompanydetailse()
            return res.render('admin_page/company/company_table', {
                title: 'Cpmany Table - BookMyTicket', companydata, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }
    // show company table 
    async company_single_details(req, res) {
        try {
            const id=req.params.id
            const company = await organizerRepositories.findallcompanybyid(id)
            console.log(company)
            return res.render('admin_page/company/single_company_details', {
                 company, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }
    async company_reject_page(req, res) {
        try {
            const id = req.params.id;
            console.log(req.query)
            const company = await organizerRepositories.findallcompanybyid(id);
            return res.render('admin_page/company/companyreject', {
                title: 'Company Reject  - BookMyTicket', company, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }

    async company_reject_data_store(req, res) {
        try {
            const id = req.params.id;
            console.log(req.body)
            const { reason } = req.body
            const mdata = await organizerRepositories.findid(id)
            const str = (mdata.phone).toString();
            const hasp=await hashpassword(str)
            const company = await organizerRepositories.companyreject(id, reason, hasp);
            const cdata = await organizerRepositories.findid(id)
            if (company) {
                const emain = await transporter.sendMail({
                    from: `BookMyTicket ${process.env.EMAIL_FROM}`, // sender address
                    to: cdata.email, // list of receivers
                    subject: "Your Company Registration Has Been Rejected", // Subject line
                    html: `  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                                    <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                                        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                                        <h2 style="margin: 0;">Company Rejection Notice</h2>
                                        </div>
                                        <div style="padding: 30px;">
                                        <p>Dear <strong>${cdata.company_name}</strong>,</p>
                                        <p>Thank you for registering with <strong>TicketBook</strong>. After reviewing your application, we regret to inform you that your company registration has been <strong style="color: red;">rejected</strong>.</p>

                                        <h4 style="margin-top: 20px;">Reason for Rejection:</h4>
                                        <p style="background-color: #f8d7da; padding: 10px 15px; border-left: 5px solid #dc3545; border-radius: 4px;">
                                            ${cdata.adminreject_msg}
                                        </p>

                                        <p>If you have any questions or wish to appeal this decision, please contact our support team. You may reapply after resolving the above issues.</p>

                                        <p style="margin-top: 30px;">Sincerely,<br>
                                        <strong>BookMyTicket Admin Team</strong></p>
                                        </div>
                                    </div>
                                    </div>`
                })
                if (emain) {
                    req.flash('success', 'Company Reject successfully')
                    return res.status(200).json({ success: true });
                }
            }

        } catch (err) {
            console.log(err)
        }
    }
    async companies_approve(req, res) {
        try {
            const id = req.params.id;

            const cdata = await organizerRepositories.findid(id)
            const company = await organizerRepositories.companyapproved(id);
            if (company) {
                const emain = await transporter.sendMail({
                    from: `BookMyTicket ${process.env.EMAIL_FROM}`, // sender address
                    to: cdata.email, // list of receivers
                    subject: "Your Company Has Been Approved - Login Details Included", // Subject line
                    html: ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #2d3748;">Company Approval Notification</h2>
                                <p>Dear <strong>${cdata.company_name}</strong>,</p>

                                <p>We are pleased to inform you that your company registration has been <strong style="color: green;">approved</strong>.</p>

                                <h4 style="color: #1a202c;">Login Credentials</h4>
                                <table style="border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px; font-weight: bold;">Username:</td>
                                    <td style="padding: 8px;">${cdata.email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold;">Password:</td>
                                    <td style="padding: 8px;">${cdata.phone}</td>
                                </tr>
                                </table>

                                <p style="margin-top: 15px;">
                                You can log in to your dashboard here:<br>
                                <a href="http://localhost:3006/organizer/dashboard" target="_blank" style="color: #007bff;">http://localhost:3006/organizer/dashboard</a>
                                </p>
                                <p style="margin-top: 15px; color: #b91c1c; font-weight: bold;">
                                ⚠️ For your account’s security, please change your password immediately after logging in.
                                </p>
                                You can Change your Password here:<br>
                                <a href="http://localhost:3006/organizer/dashboard" target="_blank" style="color: #007bff;">http://localhost:3006/organizer/dashboard</a>
                                <p>If you have any questions, please contact us at <a href="mailto:support@boomyticket.com">support@boomyticket.com</a>.</p>

                                <p>Best regards,<br><strong>Admin Team</strong><br>BookMyTicket</p>

                                <hr style="margin-top: 30px;">
                                <small style="color: gray;">This is an automated message. Do not reply to this email.</small>
                            </div>`
                })
                if (emain) {
                    req.flash('success', 'Company Approved successfully')
                    return res.redirect('/admin/companies')
                }
                 req.flash('success', 'Company Approved successfully But Email Send Error')
                    return res.redirect('/admin/companies')
            }

        } catch (err) {
            console.log(err)
        }
    }




}
module.exports = new adminCompanyController();