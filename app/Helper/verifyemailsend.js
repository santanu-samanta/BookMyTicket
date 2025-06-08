
const transporter = require("../Config/emailConfig")
const userRepositories = require("../Module/user/Repositories/user.repositories")
const jwt=require('jsonwebtoken')
 // user email verify
   const verify= async (email) =>{
        try {
            const usereesistchack = await userRepositories.existuser(email)

            const token = jwt.sign({
                _id: usereesistchack._id,
                first_name: usereesistchack.first_name,
                last_name: usereesistchack.last_name,
                phone: usereesistchack.phone,
                email: usereesistchack.email,
                date_of_birth: usereesistchack.date_of_birth,
                role: usereesistchack.role
            }, process.env.JWTSECRECT || 'WEBSKITTERFINALPROJECT', { expiresIn: '15m' })

            const link = `${process.env.BACKEND_URL}/user/emailverify/${token}`
            const emailinfo = await transporter.sendMail({
                from: `BookMyTicket${process.env.EMAIL_FROM}`, // sender address
                to: email, // list of receivers
                subject: "Verify Your Email", // Subject line
                html: `<!DOCTYPE html>
                        <html lang="en" >
                        <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>Verify Your Email</title>
                        <style>
                            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f6f8; color: #333; }
                            .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px; }
                            h1 { font-size: 24px; margin-bottom: 16px; }
                            p { font-size: 16px; line-height: 1.5; margin-bottom: 24px; }
                            .btn { display: inline-block; background-color: #007bff; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 5px; font-weight: bold; font-size: 16px; }
                            .btn:hover { background-color: #0056b3; }
                            .footer { font-size: 12px; color: #999; margin-top: 30px; text-align: center; }
                            @media only screen and (max-width: 620px) {
                            .container { width: 90% !important; padding: 20px !important; }
                            h1 { font-size: 20px !important; }
                            .btn { font-size: 14px !important; padding: 12px 24px !important; }
                            }
                        </style>
                        </head>
                        <body>
                        <div class="container" role="main" aria-labelledby="email-title">
                            <h1 id="email-title">Welcome to Your Company Name!</h1>
                            <p>Hello <strong>${usereesistchack.first_name}</strong>,</p>
                            <p>Thank you for registering with us. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                            <p style="text-align:center;">
                            <a href="${link}" class="btn" target="_blank" rel="noopener">Verify Email Address</a>
                            </p>
                            <p>If the button above doesn’t work, copy and paste the following link into your web browser:</p>
                            <p><a href="${link}" target="_blank" rel="noopener" style="word-break: break-word;">${link}</a></p>
                            <p>If you did not create an account, no further action is required.</p>
                            <p>Best regards,<br /><strong>BookMyTicket Team</strong></p>
                            <div class="footer">
                            <p>BookMyTicket | Kolkata | India | <a href="mailto:support@bookmyticket.com">support@bookmyticket.com</a></p>
                            </div>
                        </div>
                        </body>
                        </html>
                        `, // html body
            })
            if(emailinfo){
                return emailinfo;
            }
            
        } catch (error) {
            console.log(error)
           
        }
    }
    module.exports=verify