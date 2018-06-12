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
const mailer = require('../mailer');
const { postgresDateFormat } = require('../constants');

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
    attachSortPagination(knexQuery, requestQuery);
    const filterableFields = ['status', 'type', 'purpose', 'processing_time'];
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
      const endOfDay = new dayjs(requestQuery.created_at)
        .add(1, 'day')
        .format(postgresDateFormat);

      try {
        knexQuery
          .where(
            knex.raw(
              `created_at > to_date('${
                requestQuery.created_at
              }', '${postgresDateFormat}')`,
            ),
          )
          .andWhere(
            knex.raw(
              `created_at < to_date('${endOfDay}', '${postgresDateFormat}')`,
            ),
          );
        countQuery
          .where(
            knex.raw(
              `created_at > to_date('${
                requestQuery.created_at
              }', '${postgresDateFormat}')`,
            ),
          )
          .andWhere(
            knex.raw(
              `created_at < to_date('${endOfDay}', '${postgresDateFormat}')`,
            ),
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

  app.get('/orders/stats', (req, res, next) => {
    let countResults = {};

    knex
      .distinct('status')
      .select()
      .from(tables.order)
      .then(statuses => {
        let countQueries = [];

        statuses.map(statusObject => {
          countResults[statusObject.status] = 0;

          countQueries.push(
            knex
              .count()
              .from(tables.order)
              .where('status', statusObject.status),
          );
        });

        Promise.all(countQueries).then(counts => {
          counts.map((countArray, index) => {
            countResults[Object.keys(countResults)[index]] =
              parseInt(countArray[0].count, 10);
          });

          return handleGetSuccess(res, countResults);
        });
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
      // send email
      mailer.sendSuccessOrderEmail(requestBody);

      const arrivalDate = requestBody.arrival_date
        ? dayjs(requestBody.arrival_date).format(postgresDateFormat)
        : '';
      const departureDate = requestBody.departure_date
        ? dayjs(requestBody.departure_date).format(postgresDateFormat)
        : '';

      // save to db
      return knex
        .insert({
          price: requestBody.price,
          country_id: requestBody.country_id,
          quantity: requestBody.quantity,
          type: requestBody.type,
          purpose: requestBody.purpose,
          processing_time: requestBody.processing_time,
          airport: requestBody.airport,
          arrival_date: arrivalDate,
          departure_date: departureDate,
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
