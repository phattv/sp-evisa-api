'use strict';
const nodemailer = require('nodemailer');
const fs = require('fs');

// create reusable transporter object using the default SMTP transport
const fromAddress = '<no-reply@evisa-vn.com>';
const replyToAddress = 'contact@evisa-vn.com';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'no-reply@evisa-vn.com',
    pass: 'Ev!s@-vn.COM',
  },
});

const sendSuccessOrderEmail = requestBody => {
  let contact = {};
  try {
    contact = JSON.parse(requestBody.contact);
  } catch (e) {
    console.log('xxx', 'cannot parse requestBody.contact');
  }

  fs.readFile('./emails/success-order.html', (error, template) => {
    let mailOptions = {
      from: fromAddress,
      to: contact.email,
      replyTo: replyToAddress,
      subject: 'Vietnam visa confirmation',
      html: template,
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log('XXX mailer ERROR: ', error);
      }
      console.log('Message sent: ', info.messageId);
    });
  });
};

module.exports = {
  sendSuccessOrderEmail,
};
