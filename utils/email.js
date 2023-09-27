const nodemailer = require('nodemailer')

const sendEmail = async options => {
//	1) Create transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        port: 465,
        auth: {
            user: "debanjan.barman@zohomail.in",
            pass: "!9&F$JAr3Kf*Q3xZ@yB4pyaWnwTfaB6*dYbY&Ee$Ph^n7EkZ7c95pfuNp%i$@M5VVC#$*J87MvPf2#jKzYwBNu^^j@3Z@J*abUoy",
        }
    })

//	2) Define the email options
    const mailOptions = {
        from: "debanjan.barman@zohomail.in",
        to: options.email, subject: options.subject, text: options.message
    }
//	3) Send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
