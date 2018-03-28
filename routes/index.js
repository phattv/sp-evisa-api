const Knex = require('knex');
const psqlConfigs = require('../config');
const tables = require('../tables.json');
const knex = connect();

function connect() {
  const isProduction = process.env.NODE_ENV === 'production';
  const config = {
    user: process.env.SQL_USER || psqlConfigs.SQL_USER,
    password: process.env.SQL_PASSWORD || psqlConfigs.SQL_PASSWORD,
    database: process.env.SQL_DATABASE || psqlConfigs.SQL_DATABASE,
    host: isProduction ? '10.148.0.2' : '127.0.0.1',
  };

  // Connect to the database
  return Knex({
    client: 'pg',
    connection: config,
  });
}

module.exports = app => {
  app.get('/', (req, res) =>
    res
      .status(200)
      .send('evisa-vn.com API server, environment: ' + process.env.NODE_ENV),
  );

  // TODO: split to countries.js
  app.get('/countries', (req, res, next) => {
    return knex
      .select()
      .from(tables.country)
      .then(countries => {
        res
          .status(200)
          .send(countries)
          .end();
      })
      .catch(err => logErrors(err, next));
  });

  app.get('/countries/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return returnBadRequest(res, 'invalid params');
    }
    return knex
      .select()
      .from(tables.country)
      .where('id', req.params.id)
      .then(countries => {
        res
          .status(200)
          .send((countries || [])[0])
          .end();
      })
      .catch(err => logErrors(err, next));
  });

  // TODO: split to fees.js
  app.get('/fees', (req, res, next) => {
    return knex
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
      })
      .then(fees => {
        res
          .status(200)
          .send(fees)
          .end();
      })
      .catch(err => logErrors(err, next));
  });

  app.post('/fees', (req, res, next) => {
    const validTypes = ['tourist', 'business'];
    const fee = req.body;
    console.log('xxx', fee);
    if (Object.keys(fee).length === 0) {
      return returnBadRequest(res);
    } else if (!fee.country_id) {
      return returnBadRequest(res, 'invalid "country_id"');
    } else if (!fee.type || !validTypes.includes(fee.type)) {
      return returnBadRequest(res, 'invalid "type"');
    } else {
      return knex
        .insert({
          country_id: fee.country_id,
          type: fee.type,
          one_month_single: fee.one_month_single,
          one_month_multiple: fee.one_month_multiple,
          three_month_single: fee.three_month_single,
          three_month_multiple: fee.three_month_multiple,
          six_month_multiple: fee.six_month_multiple,
          one_year_multiple: fee.one_year_multiple,
        })
        .into(tables.fee)
        .then(result => {
          res
            .status(200)
            .send('inserted successfully')
            .end();
        })
        .catch(err => logErrors(err, next));
    }
  });
};

// TODO: split to utils.js
function returnBadRequest(res, message) {
  return res.status(400).send(message || 'Bad request');
}

function logErrors(err, next) {
  console.error('xxx ERROR!', err.stack);
  next(err);
}
