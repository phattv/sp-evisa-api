const { handleErrors, handleBadRequest, handleGetSuccess } = require('./utils');
const tables = require('../tables.json');

const configCountryApis = (app, knex) => {
  app.get('/countries', (req, res, next) => {
    return knex
      .select()
      .from(tables.country)
      .then(countries => handleGetSuccess(res, countries))
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
