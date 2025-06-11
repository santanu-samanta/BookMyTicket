const transporter = require("../../../Config/emailConfig");
const { movieValidationSchema } = require("../../../Helper/joivalidation");
const adminArtistRepo = require("../Repositories/admin.artist.repo");
const adminEventRepositories = require("../Repositories/admin.event.repositories");

const adminMovieRepo = require("../Repositories/admin.movie.repo");


class admineventController {
    async event_list(req, res) {
        try {
            const eventdata= await adminEventRepositories.findalldata();
            console.log(JSON.stringify(eventdata,null,2))
            return res.render('admin_page/event/event-list', {
                title: 'Event list - BookMyTicket', eventdata, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }
    async past_event_list(req, res) {
        try {
            const eventdata= await adminEventRepositories.pastfindalldata();
            console.log(JSON.stringify(eventdata,null,2))
            return res.render('admin_page/event/event-list', {
                title: 'Event list - BookMyTicket', eventdata, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }
    async delete_event_list(req, res) {
        try {
            const eventdata= await adminEventRepositories.deletefindalldata();
            console.log(JSON.stringify(eventdata,null,2))
            return res.render('admin_page/event/delete-event-list', {
                title: 'Event list - BookMyTicket', eventdata, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }
    async event_details(req, res) {
        try {
            const id=req.params.id
            const event= await adminEventRepositories.finddatabyid(id);
            // console.log(JSON.stringify(eventdata,null,2))
            return res.render('admin_page/event/event-detailse', {
                title: 'Event list - BookMyTicket', event, user:req.admin
            })
        } catch (err) {
            console.log(err)
        }
    }
    async event_reject(req, res) {
        try {
            const id=req.params.id
              const { msg } = req.query;
            const event= await adminEventRepositories.finddatabyidupdate(id,msg);
            const eventdata= await adminEventRepositories.finddatabyid(id);

            if(event){
                const sendmail=await transporter.sendMail({
                     from: `BookMyTicket ${process.env.EMAIL_FROM}`,
                    to: eventdata.company_id.email,
                    subject: `Your Event Booking Has Been Rejected – Action Required`,
                    html:`<!DOCTYPE html>
                        <html lang="en">
                        <head>
                        <meta charset="UTF-8" />
                        <title>Event Rejection Notice</title>
                        <style>
                        body {
                        font-family: 'Segoe UI', sans-serif;
                        color: #333;
                        background-color: #f7f7f7;
                        padding: 20px;
                        }
                        .email-container {
                        background-color: #fff;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        padding: 30px;
                        max-width: 600px;
                        margin: auto;
                        }
                        .header {
                        color: #c0392b;
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        }
                        .footer {
                        margin-top: 30px;
                        font-size: 13px;
                        color: #888;
                        }
                        .btn {
                        display: inline-block;
                        background-color: #c0392b;
                        color: #fff;
                        padding: 10px 20px;
                        border-radius: 4px;
                        text-decoration: none;
                        margin-top: 20px;
                        }
                    </style>
                    </head>
                    <body>
                    <div class="email-container">
                        <div class="header">Event Booking Rejected</div>

                        <p>Dear <strong>${eventdata.company_id.company_name}</strong>,</p>

                        <p>We regret to inform you that your event booking request for <strong>${eventdata.event_name}</strong> has been reviewed and <span style="color:#c0392b;"><strong>rejected</strong></span> by our administrative team.</p>

                        <p><strong>Reason for Rejection:</strong></p>
                        <blockquote style="border-left: 3px solid #c0392b; padding-left: 10px; color: #555;">
                        ${eventdata.adminreject_msg}
                        </blockquote>

                        <p>If you have any questions or would like to revise and resubmit your request, feel free to contact our support team at <a href="mailto:support@bookmyticket.com">support@bookmyticket.com</a>.</p>

                        <a href="http://localhost:3006/organizer/dashboard" class="btn">Go to Dashboard</a>

                        <div class="footer">
                        Thank you for using our platform.<br/>
                        — The Admin Team
                        </div>
                    </div>
                    </body>
                    </html>`
                })
                if(sendmail){
                    req.flash('success', 'Event Reject Sucessfully and Send Reject Email');
                    return res.redirect('/admin/event/list')
                }
                  req.flash('success', 'Event Reject Sucessfully and Reject Email Not Send');
                    return res.redirect('/admin/event/list')
            }
            req.flash('warning', 'Some error occurred');
                    return res.redirect('/admin/event/list')
        } catch (err) {
            console.log(err)
        }
    }
    async event_approved(req, res) {
        try {
            const id=req.params.id
              const { msg } = req.query;
            const event= await adminEventRepositories.finddatabyidupdateapproved(id,msg);
            const eventdata= await adminEventRepositories.finddatabyid(id);

            if(event){
                const sendmail=await transporter.sendMail({
                     from: `BookMyTicket ${process.env.EMAIL_FROM}`,
                    to: eventdata.company_id.email,
                    subject: `Your Event ${eventdata.event_name} Has Been Approved`,
                    html:`<!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8" />
                    <title>Event Approval Update</title>
                    <style>
                        body {
                    font-family: 'Segoe UI', sans-serif;
                    background-color: #f4f6f9;
                    color: #333;
                    padding: 20px;
                    }
                    .email-wrapper {
                    max-width: 600px;
                    margin: auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
                    }
                    h2 {
                    color: #2ecc71;
                    margin-bottom: 20px;
                    }
                    p {
                    line-height: 1.6;
                    }
                    .message-box {
                    background-color: #f1f8f4;
                    border-left: 4px solid #2ecc71;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                    font-style: italic;
                    }
                    .btn {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #2ecc71;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 4px;
                    }
                    .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #777;
                    }
                </style>
                </head>
                <body>
                <div class="email-wrapper">
                    <h2>Event Approved: "${eventdata.event_name}"</h2>

                    <p>Dear <strong>${eventdata.company_id.company_name}
                </strong>,</p>

                    <p>We are pleased to inform you that your event booking request titled "<strong>${eventdata.event_name}</strong>" has been <strong style="color: #2ecc71;">approved</strong> after further review.</p>

                    <p><strong>Admin Message:</strong></p>
                    <div class="message-box">
                    
                ${eventdata.admindelete_msg}
                    </div>

                    <p>You may now manage your event, tickets, and schedules through your company dashboard.</p>
                    <a href="http://localhost:3006/organizer/dashboard" class="btn">Go to Dashboard</a>
                    <p>If you have any questions or would like to revise and resubmit your request, feel free to contact our support team at <a href="mailto:support@bookmyticket.com">support@bookmyticket.com</a>.</p>
                    <div class="footer">
                    Thank you for being part of our platform.<br />
                    – The Admin Team
                    </div>
                </div>
                </body>
                </html>`

                })
                if(sendmail){
                    req.flash('success', 'Event Approved Sucessfully and Send Approved Email');
                    return res.redirect('/admin/delete/event/list')
                }
                  req.flash('success', 'Event Approved  Sucessfully and Approved  Email Not Send');
                    return res.redirect('/admin/delete/event/list')
            }
            req.flash('warning', 'Some error occurred');
                    return res.redirect('/admin/delete/event/list')
        } catch (err) {
            console.log(err)
        }
    }

   
    
}
module.exports = new admineventController();