const { handleErrors, handleBadRequest, handleGetSuccess } = require('./utils');
const tables = require('../tables.json');
const visibleFields = [
  'id',
  'email',
  'name',
  'gender',
  'phone',
  'country_id',
  'passport',
  'passport_expiry',
  'birthday',
];

const configUserApis = (app, knex) => {
  app.get('/users', (req, res, next) => {
    return knex
      .select(visibleFields)
      .from(tables.user)
      .then(users => handleGetSuccess(res, users))
      .catch(err => handleErrors(err, res));
  });

  app.get('/users/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return handleBadRequest(res, 'invalid params');
    }
    return knex
      .select(visibleFields)
      .from(tables.users)
      .where('id', req.params.id)
      .first()
      .then(country => handleGetSuccess(res, country))
      .catch(err => handleErrors(err, res));
  });
};

module.exports = { configUserApis, visibleFields };
