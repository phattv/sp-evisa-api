const {
  handleErrors,
  handleBadRequest,
  handleGetSuccess,
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
        })
        .into(tables.order)
        .then(fee => handlePostSuccess(res, fee))
        .catch(err => handleErrors(err, res));
    }
  });
};

module.exports = { configOrderApis };
