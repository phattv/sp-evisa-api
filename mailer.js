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
const borderStyles = 'border:1px solid #D6D9DF;';
const tdStyle = `padding: 5px; ${borderStyles}`;

const sendSuccessOrderEmail = requestBody => {
  let contact = {};
  let applicants = [];
  try {
    contact = JSON.parse(requestBody.contact);
    applicants = JSON.parse(requestBody.applicants);
  } catch (e) {
    console.log(
      'xxx',
      'cannot parse requestBody.contact or requestBody.applicants',
    );
  }

  fs.readFile('./emails/success-order.html', 'utf8', (error, template) => {
    const visaOptionsHtml = prepareVisaOptionsHtml(requestBody);
    const applicantsHtml = prepareApplicantsHtml(applicants);
    const contactHtml = prepareContactHtml(contact);
    const templateWithData = template
      .replace('${customer}', contact.name)
      .replace('${visa_options}', visaOptionsHtml)
      .replace('${applicant_details}', applicantsHtml)
      .replace('${contact_information}', contactHtml);

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
        return console.log('xxx mailer ERROR: ', error);
      }
      console.log('Message sent: ', info.messageId);
    });
  });
};

// TODO: bind options: processing_time, country_id
const prepareVisaOptionsHtml = requestBody => {
  return `
<table width="400" border="0" style="${borderStyles}">
  <tr>
    <td style="${tdStyle}">Type of visa</td>
    <td style="${tdStyle}">${requestBody.type.replace(/_/g, ' ')}</td>
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

const prepareApplicantsHtml = applicants => {
  let htmlString = `
<table width="400" border="0" style="${borderStyles}">
  <tr>
    <td style="${tdStyle}">Name</td>
    <td style="${tdStyle}">Gender</td>
    <td style="${tdStyle}">Birthday</td>
    <td style="${tdStyle}">Country</td>
    <td style="${tdStyle}">Passport</td>
    <td style="${tdStyle}">Passport expiry</td>
  </tr>
`;

  const applicantIndexes = Object.keys(applicants);
  if (applicantIndexes.length > 0) {
    applicantIndexes.forEach(index => {
      return (htmlString += `
<tr>
  <td style="${tdStyle}">${applicants[index].name}</td>
  <td style="${tdStyle}">${applicants[index].gender}</td>
  <td style="${tdStyle}">${applicants[index].birthday}</td>
  <td style="${tdStyle}">${applicants[index].country_id}</td>
  <td style="${tdStyle}">${applicants[index].passport}</td>
  <td style="${tdStyle}">${applicants[index].passport_expiry}</td>
</tr>      
`);
    });
  }

  htmlString += '</table>';
  return htmlString;
};

const prepareContactHtml = contact => `
<table width="400" border="0" style="${borderStyles}">
  <tr>
    <td style="${tdStyle}">Name</td>
    <td style="${tdStyle}">${contact.name}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Email</td>
    <td style="${tdStyle}">${contact.email}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Phone</td>
    <td style="${tdStyle}">${contact.phone}</td>
  </tr>
</table>   
`;

module.exports = {
  sendSuccessOrderEmail,
};
