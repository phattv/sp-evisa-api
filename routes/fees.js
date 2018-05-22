const {
  handleErrors,
  handleBadRequest,
  handleGetSuccess,
  handlePutSuccess,
  handleDeleteSuccess,
  handlePostSuccess,
  attachSortPagination,
} = require('./utils');
const tables = require('../tables.json');

const configFeeApis = (app, knex) => {
  app.get('/fees', (req, res, next) => {
    const countQuery = knex.count('*').from(tables.fee);
    const knexQuery = knex
      .select(
        `${tables.country}.id as country_id`,
        `${tables.fee}.id`,
        'type',
        'one_month_single',
        'one_month_multiple',
        'three_month_single',
        'three_month_multiple',
        'six_month_multiple',
        'one_year_multiple',
      )
      .from(tables.fee)
      .join(tables.country, function() {
        this.on(`${tables.fee}.country_id`, '=', `${tables.country}.id`);
      });

    const requestQuery = req.query;
    attachSortPagination(knexQuery, requestQuery);
    if (requestQuery.type) {
      knexQuery.where({
        type: requestQuery.type,
      });
      countQuery.where({
        type: requestQuery.type,
      });
    }

    return Promise.all([knexQuery, countQuery])
      .then(data => {
        const fees = data[0];
        const { count } = data[1][0];

        res.header('X-Total-Count', count);
        return handleGetSuccess(res, fees);
      })
      .catch(err => handleErrors(err, res));
  });

  app.get('/fees/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return handleBadRequest(res, 'invalid params');
    }
    return knex
      .select()
      .from(tables.fee)
      .where('id', req.params.id)
      .first()
      .then(fees => handleGetSuccess(res, fees))
      .catch(err => handleErrors(err, res));
  });

  app.get('/fees-by-country/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return handleBadRequest(res, 'invalid params');
    }
    return knex
      .select()
      .from(tables.fee)
      .where('country_id', req.params.id)
      .then(fee => handleGetSuccess(res, fee))
      .catch(err => handleErrors(err, res));
  });

  app.put('/fees/:id', (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      return handleBadRequest(res, 'invalid params');
    }

    let {
      country_id,
      type,
      one_month_single = 0,
      one_month_multiple = 0,
      three_month_single = 0,
      three_month_multiple = 0,
      six_month_multiple = 0,
      one_year_multiple = 0,
    } = req.body;

    if (!one_month_single) {
      one_month_single = 0;
    }
    if (!one_month_multiple) {
      one_month_multiple = 0;
    }
    if (!three_month_single) {
      three_month_single = 0;
    }
    if (!three_month_multiple) {
      three_month_multiple = 0;
    }
    if (!six_month_multiple) {
      six_month_multiple = 0;
    }
    if (!one_year_multiple) {
      one_year_multiple = 0;
    }

    return knex(tables.fee)
      .where('id', req.body.id)
      .update({
        country_id,
        type,
        one_month_single,
        one_month_multiple,
        three_month_single,
        three_month_multiple,
        six_month_multiple,
        one_year_multiple,
      })
      .then(fee => handlePutSuccess(res, fee))
      .catch(err => handleErrors(err, res));
  });

  app.post('/fees', (req, res, next) => {
    const validTypes = ['tourist', 'business'];
    const requestBody = req.body;
    if (Object.keys(requestBody).length === 0) {
      return handleBadRequest(res);
    } else if (!requestBody.country_id) {
      return handleBadRequest(res, 'invalid "country_id"');
    } else if (!requestBody.type || !validTypes.includes(requestBody.type)) {
      return handleBadRequest(res, 'invalid "type"');
    } else {
      return knex
        .insert({
          country_id: requestBody.country_id,
          type: requestBody.type,
          one_month_single: requestBody.one_month_single,
          one_month_multiple: requestBody.one_month_multiple,
          three_month_single: requestBody.three_month_single,
          three_month_multiple: requestBody.three_month_multiple,
          six_month_multiple: requestBody.six_month_multiple,
          one_year_multiple: requestBody.one_year_multiple,
        })
        .into(tables.fee)
        .then(fee => handlePostSuccess(res, fee))
        .catch(err => handleErrors(err, res));
    }
  });

  app.delete('/fees/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return handleBadRequest(res, 'invalid params');
    }

    return knex
      .delete()
      .from(tables.fee)
      .where('id', req.params.id)
      .then(fee => handleDeleteSuccess(res, fee))
      .catch(err => handleErrors(err, res));
  });
};

module.exports = { configFeeApis };
