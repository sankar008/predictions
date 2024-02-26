var nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = (req, res) => {
    const body = req.body;
    try{
        let to = "federico.dipietrantonio88@gmail.com"
        let subject = body.title
        let emailbody = `<div>${body.content}</div>`

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER_NAME,
                pass: process.env.SMTP_PASSWORD
            }
        });

        var mailOptions = {
            from: `Predibets<${process.env.SMTP_USER_NAME}>`,
            to: to,
            subject: subject,
            html: emailbody
        };


        transporter.sendMail(mailOptions, function (error, info) {
            return res.status(200).json({
                success: 1,
                message: "Mail send successfully!"
            })
        });

    }catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

module.exports = {
    sendEmail:sendEmail
}