const transporter = require("../../../Config/emailConfig");
const { movieValidationSchema } = require("../../../Helper/joivalidation");
const userRepositories = require("../../user/Repositories/user.repositories");
const adminArtistRepo = require("../Repositories/admin.artist.repo");
const adminEventRepositories = require("../Repositories/admin.event.repositories");

const adminMovieRepo = require("../Repositories/admin.movie.repo");


class adminreviewanduserController {
    async user_list(req, res) {
        try {
            const userdata= await userRepositories.findalldatauser();
            console.log(JSON.stringify(userdata,null,2))
            return res.render('admin_page/reviewanduser/user-list', {
                title: 'Review list - BookMyTicket', userdata
            })
        } catch (err) {
            console.log(err)
        }
    }
    async delete_user_list(req, res) {
        try {
            const userdata= await userRepositories.findalldatauseradmin();
           
            return res.render('admin_page/reviewanduser/userdel-list', {
                title: 'Review list - BookMyTicket', userdata
            })
        } catch (err) {
            console.log(err)
        }
    }

    
    // review list
    async review_list(req, res) {
        try {
            const reviewdata= await userRepositories.findalldatatestimonial();
            console.log(JSON.stringify(reviewdata,null,2))
            return res.render('admin_page/reviewanduser/review-list', {
                title: 'Review list - BookMyTicket', reviewdata
            })
        } catch (err) {
            console.log(err)
        }
    }


    // delete review list
    async delete_review_list(req, res) {
        try {
            const reviewdata= await userRepositories.findalldeletedatatestimonial();
            // console.log(JSON.stringify(eventdata,null,2))
            return res.render('admin_page/reviewanduser/reviewdel-list', {
                title: 'Event list - BookMyTicket', reviewdata
            })
        } catch (err) {
            console.log(err)
        }
    }


    // show review detailse
    async review_details(req, res) {
        try {
            const id=req.params.id
            const event= await userRepositories.finddatabyidtestimon(id);
            console.log(JSON.stringify(event,null,2))
            return res.render('admin_page/reviewanduser/review_det', {
                title: 'Event list - BookMyTicket',eventdata:event
            })
        } catch (err) {
            console.log(err)
        }
    }


    // review delete
    async review_delete(req, res) {
        try {
            const admin_msg=req.query.msg
            const id=req.params.id
            const eventS= await userRepositories.finddatabyidtestimon(id);
            const event= await userRepositories.finddatabyidtestdelete(id ,admin_msg);
            // console.log(JSON.stringify(event,null,2))
           if(event){
                 if(event){
                const sendmail=await transporter.sendMail({
                     from: `BookMyTicket ${process.env.EMAIL_FROM}`,
                    to: eventS.userid.email,
                    subject: `Your Event Booking Has Been Rejected – Action Required`,
                    html:`<p>Dear <strong>${eventS.userid.first_name}</strong>,</p>
                                <p>We hope this message finds you well.</p>

                                <p>We are writing to inform you that the review you recently submitted on our platform <strong>(BookMyTicket)</strong> has been flagged for violating our community guidelines.</p>

                                <p>You Spreading false or misleading information not only harms the integrity of our platform but also negatively impacts users and businesses who rely on honest and constructive feedback.</p>

                                <hr>

                                <p><strong>This is an official warning.</strong></p>
                                <p>If any similar activity is detected in the future, your account may be permanently <span style="color: red; font-weight: bold;">suspended or deleted</span> without further notice.</p>

                                <hr>

                                <p>If you believe this warning has been sent in error, or if you would like to clarify the situation, you may contact us at <a href="mailto:support@bookmyticket.com">support@bookmyticket.com</a>.</p>

                                <p>We appreciate your cooperation in helping us maintain a trustworthy and respectful community.</p>

                                <br>

                                <p>Best regards,</p>
                                <p><strong>BookMyTicket Team</strong></p>
                                `
                })
                if(sendmail){
                    req.flash('success', 'Testimonial Delete Sucessfully and Send Worning Email');
                    return res.redirect('/admin/review/list')
                }
                  req.flash('success', 'Testimonial Delete Sucessfully and  Worning Email Not Send');
                    return res.redirect('/admin/review/list')
            }
            req.flash('error', 'Some error occurred');
                    return res.redirect('/admin/review/list')
           }
        } catch (err) {
            console.log(err)
        }
    }


    // user account delete
    async user_account_delete(req, res) {
        try {
            const id=req.params.id
              const { msg } = req.query;
            const useraccount= await userRepositories.finddatabyiduser(id);
          if(useraccount.isadmindelete)  {
                    req.flash('success', 'User Account Already Delete ');
                    return res.redirect('/admin/delete/user/list') 
            }
            const eventdata= await userRepositories.accountdeleteupdate(id,msg);

            if(eventdata){
                const sendmail=await transporter.sendMail({
                     from: `BookMyTicket ${process.env.EMAIL_FROM}`,
                    to: useraccount.email,
                    subject: `🚫 Your BookMyTicket Account Has Been Permanently Deleted`,
                    html:`<div style="font-family: Arial, sans-serif; color: #333;">
                            <p>Dear ${useraccount.first_name},</p>
                            <p>We are writing to inform you that your <strong>BookMyTicket</strong> account has been <strong>permanently deleted</strong> due to repeated violations of our platform's community guidelines.</p>
                            <p>Despite a prior warning, further suspicious or inappropriate reviews were posted from your account.</p>
                            <p><strong>This action is final and irreversible.</strong> If you believe this was a mistake, you may appeal within 7 days by contacting <a href="mailto:support@bookmyticket.com">support@bookmyticket.com</a>.</p>
                            <p>Thank you for your attention to this matter.</p>
                            <br/>
                            <p>Sincerely,<br/>BookMyTicket Compliance Team</p>
                        </div>`
                             })
                if(sendmail){
                    req.flash('success', 'User Account Delete Sucessfully and Send  Email');
                    return res.redirect('/admin/delete/user/list')
                }
                  req.flash('success', 'User Account Delete  and  Email Not Send');
                    return res.redirect('/admin/delete/user/list')
            }
            req.flash('error', 'Some error occurred');
                    return res.redirect('/admin/delete/user/list')
        } catch (err) {
            console.log(err)
        }
    }

    
    // user account undo
    async user_account_undo(req, res) {
        try {
            const id=req.params.id
             
            const useraccount= await userRepositories.finddatabyiduser(id);
            
            const eventdata= await userRepositories.accountundoupdate(id);

             if(!useraccount.isadmindelete)  {
                    req.flash('success', 'User Account Already undo ');
                    return res.redirect('/admin/delete/user/list') 
            }
            if(eventdata){
                  req.flash('success', 'User Account Undo Successfuly');
                    return res.redirect('/admin/delete/user/list') 
            }
            req.flash('error', 'Some error occurred');
                    return res.redirect('/admin/delete/user/list')
        } catch (err) {
            console.log(err)
        }
    }


    // user account bulck undo
      async user_undo_bulck(req, res) {
           const { artistIds } = req.body;
        try {
            const artist = await userRepositories.artistundomany(artistIds)
            if(artist){
                 req.flash('success', 'users Undo successfully');
                return  res.redirect('/admin/delete/user/list');
            }
           req.flash('error', 'error in users undo');
                    return res.redirect('/admin/delete/user/list');
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
        }


        // event approved
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
            req.flash('error', 'Some error occurred');
                    return res.redirect('/admin/delete/event/list')
        } catch (err) {
            console.log(err)
        }
    }

   
    
}
module.exports = new adminreviewanduserController();