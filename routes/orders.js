const {
  handleErrors,
  handleBadRequest,
  handleGetSuccess,
  handlePutSuccess,
  handlePostSuccess
} = require('./utils');
const tables = require('../tables.json');

const configOrderApis = (app, knex) => {
  app.get('/orders', (req, res, next) => {
    return knex
      .select()
      .from(tables.order)
      .then(orders => handleGetSuccess(res, orders))
      .catch(err => handleErrors(err, res));
  });

  app.get('/orders/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return handleBadRequest(res, 'invalid params');
    }
    return knex
      .select()
      .from(tables.order)
      .where('id', req.params.id)
      .first()
      .then(order => handleGetSuccess(res, order))
      .catch(err => handleErrors(err, res));
  });

  app.post('/order', (req, res, next) => {
    const requestBody = req.body;
    if (Object.keys(requestBody).length === 0) {
      return handleBadRequest(res);
    } else {
      return knex
        .insert({
          price: requestBody.price,
          country_id: requestBody.country_id,
          quantity: requestBody.quantity,
          type: requestBody.type,
          purpose: requestBody.purpose,
          processing_time: requestBody.processing_time,
          airport: requestBody.airport,
          arrival_date: requestBody.arrival_date,
          departure_date: requestBody.departure_date,
          airport_fast_track: requestBody.airport_fast_track,
          car_pick_up: requestBody.car_pick_up,
          private_visa_letter: requestBody.private_visa_letter,
          contact: requestBody.contact,
          applicants: requestBody.applicants,
          flight_number: requestBody.flight_number,
          status: 'unpaid',
        })
        .into(tables.order)
        .then(fee => handlePostSuccess(res, fee))
        .catch(err => handleErrors(err, res));
    }
  });

  app.put('/orders/:id', (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      return handleBadRequest(res, 'invalid params');
    }

    let {
      price,
      country_id,
      quantity,
      type,
      purpose,
      processing_time,
      airport,
      arrival_date,
      departure_date,
      airport_fast_track,
      car_pick_up,
      private_visa_letter,
      contact,
      applicants,
      flight_number,
      status,
    } = req.body;
    console.log('xxx', req.body);

    return knex(tables.order)
      .where('id', req.body.id)
      .update({
        price,
        country_id,
        quantity,
        type,
        purpose,
        processing_time,
        airport,
        arrival_date,
        departure_date,
        airport_fast_track,
        car_pick_up,
        private_visa_letter,
        contact,
        applicants,
        flight_number,
        status,
      })
      .then(order => handlePutSuccess(res, order))
      .catch(err => handleErrors(err, res));
  });
};

module.exports = { configOrderApis };
