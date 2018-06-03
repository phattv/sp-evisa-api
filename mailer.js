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

  fs.readFile('./emails/success-order.html', 'utf8', (error, template) => {
    const visaOptionsHtml = prepareVisaOptionsHtml(requestBody);
    const templateWithData = template
      .replace('${customer}', contact.name)
      .replace('${visa_options}', visaOptionsHtml);

    let mailOptions = {
      from: fromAddress,
      to: contact.email,
      replyTo: replyToAddress,
      subject: '[evisa-vn.com] Vietnam Visa Application Confirmation',
      html: templateWithData,
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

const prepareVisaOptionsHtml = (requestBody) => {
  const borderStyles = 'border:1px solid #D6D9DF;'
  const tdStyle = `padding: 5px;  ${borderStyles}`

  // TODO: country name

  return `
<table width="400" border="0" style="${borderStyles}">
  <tr>
    <td style="${tdStyle}">Type of visa</td>
    <td style="${tdStyle}">${requestBody.type}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Country</td>
    <td style="${tdStyle}">${requestBody.country_id}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Purpose of arrival</td>
    <td style="${tdStyle}">${requestBody.purpose}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Processing time</td>
    <td style="${tdStyle}">${requestBody.processing_time}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Arrival date</td>
    <td style="${tdStyle}">${requestBody.arrival_date}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Departure date</td>
    <td style="${tdStyle}">${requestBody.departure_date}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Arrival airport</td>
    <td style="${tdStyle}">${requestBody.airport}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Number of applicants</td>
    <td style="${tdStyle}">${requestBody.quantity}</td>
  </tr>
  <tr>
    <td style="${tdStyle}"><strong>Total service charge</strong></td>
    <td style="${tdStyle}"><strong>${requestBody.price}</strong></td>
  </tr>
</table>    
    `;
};

module.exports = {
  sendSuccessOrderEmail,
};
