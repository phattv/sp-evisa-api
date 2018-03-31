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

  //<editor-fold desc="Split to countries.js">
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
      .catch(err => handleErrors(err, res));
  });

  app.get('/countries/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return returnBadRequest(res, 'invalid params');
    }
    return knex
      .select()
      .from(tables.country)
      .where('id', req.params.id)
      .first()
      .then(country => {
        res
          .status(200)
          .send(country)
          .end();
      })
      .catch(err => handleErrors(err, res));
  });
  //</editor-fold>

  //<editor-fold desc="Split to fees.js">
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
      .catch(err => handleErrors(err, res));
  });

  app.get('/fees/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return returnBadRequest(res, 'invalid params');
    }
    return knex
      .select()
      .from(tables.fee)
      .where('id', req.params.id)
      .first()
      .then(fee => {
        res
          .status(200)
          .send(fee)
          .end();
      })
      .catch(err => handleErrors(err, res));
  });

  app.put('/fees/:id', (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      return returnBadRequest(res, 'invalid params');
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
      .then(fee => handlePutSuccess(res))
      .catch(err => handleErrors(err, res));
  });

  app.post('/fees', (req, res, next) => {
    const validTypes = ['tourist', 'business'];
    const fee = req.body;
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
        .then(fee => handlePostSuccess(res))
        .catch(err => handleErrors(err, res));
    }
  });

  app.delete('/fees/:id', (req, res, next) => {
    if (Object.keys(req.params).length === 0) {
      return returnBadRequest(res, 'invalid params');
    }

    return knex
      .delete()
      .from(tables.fee)
      .where('id', req.params.id)
      .then(fee => handleDeleteSucces(res))
      .catch(err => handleErrors(err, res));
  });
  //</editor-fold>
};

// TODO: split to utils.js
function returnBadRequest(res, message) {
  return res.status(400).send(message || 'bad request');
}

function handlePutSuccess(res) {
  return res
    .status(200)
    .send({ message: 'updated successfully' })
    .end();
}

function handlePostSuccess(res) {
  return res
    .status(200)
    .send({ message: 'inserted successfully' })
    .end();
}

function handleDeleteSucces(res) {
  return res
    .status(200)
    .send({ message: 'deleted successfully' })
    .end();
}

function handleErrors(err, res) {
  console.log('xxx ERROR!', err);
  res
    .status(400)
    .send({
      error: err,
      message: err.stack,
    })
    .end();
}
