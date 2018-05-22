const {
  handleErrors,
  handleBadRequest,
  handleGetSuccess,
  handlePutSuccess,
  handlePostSuccess,
  attachSortPagination,
} = require('./utils');
const tables = require('../tables.json');
const dayjs = require('dayjs');

const configOrderApis = (app, knex) => {
  app.get('/orders', (req, res, next) => {
    const countQuery = knex
      .count('*')
      .from(tables.order)
      .whereNot({
        status: 'hidden',
      });
    const knexQuery = knex
      .select()
      .from(tables.order)
      .whereNot({
        status: 'hidden',
      });

    // Query
    const requestQuery = req.query;
    console.log('xxx', requestQuery);
    attachSortPagination(knexQuery, requestQuery);
    const filterableFields = ['status', 'type', 'purpose'];
    filterableFields.forEach(filterableField => {
      if (requestQuery.hasOwnProperty(filterableField)) {
        knexQuery.where({
          [filterableField]: requestQuery[filterableField],
        });
        countQuery.where({
          [filterableField]: requestQuery[filterableField],
        });
      }
    });
    // filter by day
    if (requestQuery.created_at) {
      const dateFormat = 'YYYY-MM-DD';
      const endOfDay = new dayjs(requestQuery.created_at)
        .add(1, 'day')
        .format(dateFormat);

      try {
        knexQuery
          .where(
            knex.raw(
              `created_at > to_date('${
                requestQuery.created_at
              }', '${dateFormat}')`,
            ),
          )
          .andWhere(
            knex.raw(`created_at < to_date('${endOfDay}', '${dateFormat}')`),
          );
        countQuery
          .where(
            knex.raw(
              `created_at > to_date('${
                requestQuery.created_at
              }', '${dateFormat}')`,
            ),
          )
          .andWhere(
            knex.raw(`created_at < to_date('${endOfDay}', '${dateFormat}')`),
          );
      } catch (error) {
        console.log('xxx', error);
      }
    }

    return Promise.all([knexQuery, countQuery])
      .then(data => {
        const orders = data[0];
        const { count } = data[1][0];

        res.header('X-Total-Count', count);
        return handleGetSuccess(res, orders);
      })
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
          status: requestBody.status || 'unpaid',
          created_at: new Date(),
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
        updated_at: new Date(),
      })
      .then(order => handlePutSuccess(res, order))
      .catch(err => handleErrors(err, res));
  });
};

module.exports = { configOrderApis };
