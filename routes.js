const Knex = require('knex');
const psqlConfigs = require('./config');
const tables = require('./tables.json');
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

  app.get('/country', (req, res, next) => {
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

  app.get('/fees', (req, res, next) => {
    return knex
      .select('*')
      .from(tables.fee)
      .join(tables.country, function() {
        this.on(`${tables.fee}.country_iso`, '=', `${tables.country}.iso`);
      })
      .then(fees => {
        res
          .status(200)
          .send(fees)
          .end();
      })
      .catch(err => logErrors(err, next));
  });

  app.get('/fee', (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
      return returnBadRequest(res, 'invalid "country_iso"');
    } else {
      return knex
        .select()
        .from(tables.fee)
        .where('country_iso', req.query.country_iso.toUpperCase())
        .then(fees => {
          res
            .status(200)
            .send(fees)
            .end();
        })
        .catch(err => logErrors(err, next));
    }
  });

  app.post('/fee', (req, res, next) => {
    const validTypes = ['tourist', 'business'];
    const fee = req.body;
    if (Object.keys(fee).length === 0) {
      return returnBadRequest(res);
    } else if (!fee.country_iso) {
      return returnBadRequest(res, 'invalid "country_iso"');
    } else if (!fee.type || !validTypes.includes(fee.type)) {
      return returnBadRequest(res, 'invalid "type"');
    } else {
      return knex
        .insert({
          country_iso: fee.country_iso,
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

function returnBadRequest(res, message) {
  return res.status(400).send(message || 'Bad request');
}

function logErrors(err, next) {
  console.error('xxx ERROR!', err.stack);
  next(err);
}
