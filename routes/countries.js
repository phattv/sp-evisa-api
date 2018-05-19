const {
  handleErrors,
  handleBadRequest,
  handleGetSuccess,
  attachSortPagination,
} = require('./utils');
const tables = require('../tables.json');

const configCountryApis = (app, knex) => {
  app.get('/countries', (req, res, next) => {
    const countQuery = knex.count('*').from(tables.country);
    const knexQuery = knex.select().from(tables.country);

    const requestQuery = req.query;
    attachSortPagination(knexQuery, requestQuery);
    if (requestQuery.query) {
      const queryString = requestQuery.query.toLowerCase()
      knexQuery.whereRaw(`LOWER(name) LIKE ?`, [`%${queryString}%`])
      countQuery.whereRaw(`LOWER(name) LIKE ?`, [`%${queryString}%`])
    }

    return Promise.all([knexQuery, countQuery])
      .then((data) => {
        const fees = data[0]
        const { count } = data[1][0]

        res.header('X-Total-Count', count);
        return handleGetSuccess(res, fees);
      })
      .catch(err => handleErrors(err, res));
  });

  app.get('/countries/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return handleBadRequest(res, 'invalid params');
    }
    return knex
      .select()
      .from(tables.country)
      .where('id', req.params.id)
      .first()
      .then(country => handleGetSuccess(res, country))
      .catch(err => handleErrors(err, res));
  });
};

module.exports = { configCountryApis };
