'use strict';
const nodemailer = require('nodemailer');
const fs = require('fs');
const dayjs = require('dayjs');
const path = require('path');

// create reusable transporter object using the default SMTP transport
const fromAddress = 'no-reply@evisa-vn.com';
const replyToAddress = 'contact@evisa-vn.com';
const bccAddresses = 'quanghuy@evisa-vn.com, dieu@evisa-vn.com, thanhhang@evisa-vn.com';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'no-reply@evisa-vn.com',
    pass: 'Ev!s@-vn.COM',
  },
});

// constants
const {
  displayDateFormat,
  processingTimeOptions,
  typeOptions,
} = require('./constants');
const countries = require('./countries.json');

// CSS styles
const tableWidth = 600;
const tdStyle = `
height: 44px;
vertical-align: middle;
padding: 5px;
font-size: 16px;
font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
color: #2e4255;
`;
const backgroundColor = 'background-color: #f2f7ff;';

const sendSuccessOrderEmail = requestBody => {
  let contact = {};
  let applicants = [];
  try {
    contact = JSON.parse(requestBody.contact);
    applicants = JSON.parse(requestBody.applicants);
  } catch (e) {
    // TODO: Rollbar
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
      bcc: bccAddresses,
      replyTo: replyToAddress,
      subject: '[evisa-vn.com] Vietnam Visa Application Confirmation',
      html: templateWithData,
      attachments: [
        {
          filename: 'logo-horizontal.jpg',
          path: path.join(__dirname, '/emails/images/logo-horizontal.jpg'),
          cid: 'evisaLogoHorizontalImageCID',
        },
      ],
    };

    console.log('xxx', templateWithData);

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // TODO: Rollbar
        return console.log('xxx mailer ERROR: ', error);
      }
      console.log('Email sent: ', info.messageId);
    });
  });
};

const prepareVisaOptionsHtml = requestBody => {
  const formattedProcessingTime =
    processingTimeOptions[requestBody.processing_time];
  const formattedArrivalDate = requestBody.arrival_date
    ? dayjs(requestBody.arrival_date).format(displayDateFormat)
    : '';
  const formattedDepartureDate = requestBody.departure_date
    ? dayjs(requestBody.departure_date).format(displayDateFormat)
    : '';
  const country = countries.find(
    country => country.value === requestBody.country_id,
  );

  return `
<table width="${tableWidth}" border="0">
  <tr style="${backgroundColor}">
    <td style="${tdStyle}">Type of visa</td>
    <td style="${tdStyle}">${typeOptions[requestBody.type]}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Country</td>
    <td style="${tdStyle}">${country.label}</td>
  </tr>
  <tr style="${backgroundColor}">
    <td style="${tdStyle}">Purpose of arrival</td>
    <td style="${tdStyle}">${requestBody.purpose}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Processing time</td>
    <td style="${tdStyle}">${formattedProcessingTime}</td>
  </tr>
  <tr style="${backgroundColor}">
    <td style="${tdStyle}">Arrival date</td>
    <td style="${tdStyle}">${formattedArrivalDate}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Departure date</td>
    <td style="${tdStyle}">${formattedDepartureDate}</td>
  </tr>
  <tr style="${backgroundColor}">
    <td style="${tdStyle}">Arrival airport</td>
    <td style="${tdStyle}">${requestBody.airport}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Number of applicants</td>
    <td style="${tdStyle}">${requestBody.quantity}</td>
  </tr>
  <tr style="${backgroundColor}">
    <td style="${tdStyle}"><strong>Total service charge</strong></td>
    <td style="${tdStyle}"><strong>$${requestBody.price}</strong></td>
  </tr>
</table>    
`;
};

const prepareApplicantsHtml = applicants => {
  let htmlString = `
<table width="${tableWidth}" border="0">
  <tr style="${backgroundColor}">
    <td style="${tdStyle}">Name</td>
    <td style="${tdStyle}">Gender</td>
    <td style="${tdStyle}">Birthday</td>
    <td style="${tdStyle}">Country</td>
    <td style="${tdStyle}">Passport</td>
    <td style="${tdStyle}">Passport expiry</td>
  </tr>
`;

  if (applicants.length > 0) {
    applicants.forEach((applicant, index) => {
      const formattedBirthday = applicant.birthday
        ? dayjs(applicant.birthday).format(displayDateFormat)
        : '';
      const formattedPassportExpiry = applicant.passport_expiry
        ? dayjs(applicant.passport_expiry).format(displayDateFormat)
        : '';
      const country = countries.find(
        country =>
          country.value === applicant.country_id,
      );

      return (htmlString += `
${index % 2 === 0 ? `<tr>` : `<tr style="${backgroundColor}">`}
  <td style="${tdStyle}">${applicant.name}</td>
  <td style="${tdStyle}">${applicant.gender}</td>
  <td style="${tdStyle}">${formattedBirthday}</td>
  <td style="${tdStyle}">${country.label}</td>
  <td style="${tdStyle}">${applicant.passport}</td>
  <td style="${tdStyle}">${formattedPassportExpiry}</td>
</tr>      
`);
    });
  }

  htmlString += '</table>';
  return htmlString;
};

const prepareContactHtml = contact => `
<table width="${tableWidth}" border="0">
  <tr style="${backgroundColor}">
    <td style="${tdStyle}">Name</td>
    <td style="${tdStyle}">${contact.name}</td>
  </tr>
  <tr>
    <td style="${tdStyle}">Email</td>
    <td style="${tdStyle}">${contact.email}</td>
  </tr>
  <tr style="${backgroundColor}">
    <td style="${tdStyle}">Phone</td>
    <td style="${tdStyle}">${contact.phone}</td>
  </tr>
</table>   
`;

module.exports = {
  sendSuccessOrderEmail,
};
